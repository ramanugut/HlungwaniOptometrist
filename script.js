// Load the final polish layer after the base styles. The page loader hides any visual flash while it loads.
if (!document.querySelector('link[href="polish.css"]')) {
  const polish = document.createElement('link');
  polish.rel = 'stylesheet';
  polish.href = 'polish.css';
  document.head.appendChild(polish);
}

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

const closeMenu = () => {
  if (!menuToggle || !mainNav) return;
  mainNav.classList.remove('open');
  document.body.classList.remove('nav-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
};

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    document.body.classList.toggle('nav-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '✕' : '☰';
  });

  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!mainNav.classList.contains('open')) return;
    if (mainNav.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMenu();
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const pageKey = currentPage === 'index.html' ? 'home' : currentPage.replace('.html', '');
document.body.classList.add(`page-${pageKey}`);

// Shared image wiring. All uploaded images now live in /assets with clear names.
const assetAliases = {
  'assets/logo.jpg': 'assets/logo.png',
  'assets/hero.jpg': 'assets/hero-eye-exam.png',
  'assets/comprehensive-eye-exam.jpg': 'assets/service-eye-exam.png',
  'assets/spectacles.jpg': 'assets/service-spectacles.png',
  'assets/contact-lenses.jpg': 'assets/service-contact-lenses.png'
};

document.querySelectorAll('img.local-asset').forEach((img) => {
  const originalSrc = img.getAttribute('src');
  if (originalSrc && assetAliases[originalSrc]) img.setAttribute('src', assetAliases[originalSrc]);
});

// Use the logo icon as the browser tab icon on every page.
if (!document.querySelector('link[rel="icon"]')) {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = 'assets/logo-icon.png';
  document.head.appendChild(favicon);
}

// Use the general eyewear photo in the home appointment panel instead of an emoji.
const appointmentArt = document.querySelector('.appointment-art');
if (appointmentArt) {
  appointmentArt.classList.add('appointment-art-photo');
  appointmentArt.innerHTML = '<img src="assets/eyewear-store.png" alt="Eyewear selection" loading="lazy" decoding="async">';
}

// About page: use the actual consultation image instead of the CSS eye placeholder.
if (currentPage === 'about.html') {
  const visualPanel = document.querySelector('.visual-panel');
  if (visualPanel) {
    visualPanel.classList.add('wired-photo-panel');
    visualPanel.innerHTML = '<img class="wired-photo" src="assets/consultation.png" alt="Optometrist consultation" loading="lazy" decoding="async">';
  }
}

// Eye conditions page: show the real eye-exam close-up in the information section.
if (currentPage === 'conditions.html') {
  const visualPanel = document.querySelector('.visual-panel');
  if (visualPanel) {
    visualPanel.classList.add('wired-photo-panel');
    visualPanel.innerHTML = '<img class="wired-photo" src="assets/service-eye-exam-closeup.png" alt="Close-up eye examination" loading="lazy" decoding="async">';
  }
}

// Services page: use uploaded photos only where the image genuinely matches the service.
if (currentPage === 'services.html') {
  const detailImages = {
    'eye-exam': ['assets/service-eye-exam-closeup.png', 'Comprehensive eye examination'],
    'spectacles': ['assets/service-spectacles.png', 'Spectacles and glasses'],
    'contact-lenses': ['assets/service-contact-lenses.png', 'Contact lenses']
  };

  Object.entries(detailImages).forEach(([id, [src, alt]]) => {
    const card = document.getElementById(id);
    const icon = card?.querySelector('.service-detail-icon');
    if (!card || !icon) return;
    const img = document.createElement('img');
    img.className = 'service-detail-thumb';
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    icon.replaceWith(img);
  });

  const serviceGrid = document.querySelector('.service-detail-grid');
  if (serviceGrid && !document.querySelector('.services-photo-strip')) {
    const strip = document.createElement('div');
    strip.className = 'services-photo-strip';
    strip.innerHTML = '<img src="assets/eyewear-store.png" alt="Eyewear frames in an optometry store" loading="lazy" decoding="async"><div><h3>Eyewear for everyday life</h3><p>Explore frames and lenses with practical guidance so you can choose eyewear that feels comfortable and suits your daily needs.</p></div>';
    serviceGrid.parentNode.insertBefore(strip, serviceGrid);
  }
}

// Avoid downloading non-critical imagery eagerly.
document.querySelectorAll('.service-card img').forEach((img) => {
  img.loading = 'lazy';
  img.decoding = 'async';
});

// Local assets fail gracefully if image files are missing or renamed.
document.querySelectorAll('.local-asset').forEach((img) => {
  img.addEventListener('error', () => {
    const fallback = img.dataset.fallback;
    if (fallback && img.getAttribute('src') !== fallback) {
      img.src = fallback;
      return;
    }
    if (img.classList.contains('brand-logo')) {
      img.style.display = 'none';
      const brandFallback = document.querySelector('.brand-fallback');
      if (brandFallback) brandFallback.style.display = 'flex';
    }
  }, { once: true });
});

// Lightweight eye loader across all pages.
const pageLoader = document.getElementById('pageLoader');
const hideLoader = () => {
  if (!pageLoader || pageLoader.classList.contains('is-hidden')) return;
  pageLoader.classList.add('is-hidden');
  setTimeout(() => pageLoader.remove(), 300);
};

if (document.readyState === 'complete') {
  setTimeout(hideLoader, 120);
} else {
  window.addEventListener('load', () => setTimeout(hideLoader, 90), { once: true });
  setTimeout(hideLoader, 1000);
}

// Smooth reveals, kept subtle for performance and disabled for reduced-motion users.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
  const revealItems = document.querySelectorAll([
    '.service-card', '.benefits-panel', '.appointment-panel', '.booking-intro', '.booking-form-card',
    '.about-grid>div', '.info-card', '.service-detail', '.condition-card', '.contact-card', '.contact-cta',
    '.faq-item', '.simple-cta', '.visual-panel', '.copy-block', '.services-photo-strip'
  ].join(','));

  revealItems.forEach((item) => item.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Keep the floating WhatsApp action useful without covering forms, CTAs or the footer.
const whatsappFloat = document.querySelector('.whatsapp-float');
if (whatsappFloat) {
  const interactiveFields = 'input, select, textarea, button';
  document.addEventListener('focusin', (event) => {
    if (event.target.matches(interactiveFields) && event.target.closest('form')) {
      whatsappFloat.classList.add('is-context-hidden');
    }
  });
  document.addEventListener('focusout', (event) => {
    if (event.target.matches(interactiveFields) && event.target.closest('form')) {
      setTimeout(() => {
        if (!document.activeElement?.closest('form')) whatsappFloat.classList.remove('is-context-hidden');
      }, 100);
    }
  });

  const footer = document.querySelector('.footer');
  if (footer && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(([entry]) => {
      whatsappFloat.classList.toggle('is-footer-hidden', entry.isIntersecting);
    }, { threshold: 0.08 });
    footerObserver.observe(footer);
  }
}

// Appointment form: no database required. The request is prepared and sent through WhatsApp.
const appointmentForm = document.getElementById('appointmentForm');
const preferredDate = document.getElementById('preferredDate');
const serviceSelect = document.getElementById('service');
const formStatus = document.getElementById('formStatus');
const submitBooking = appointmentForm?.querySelector('.submit-booking');

if (preferredDate) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  preferredDate.min = localToday;
}

if (serviceSelect) {
  const requestedService = new URLSearchParams(window.location.search).get('service');
  if (requestedService) {
    const match = [...serviceSelect.options].find((option) => option.value === requestedService || option.text === requestedService);
    if (match) serviceSelect.value = match.value;
  }
}

if (appointmentForm) {
  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus?.classList.remove('error');

    if (!appointmentForm.checkValidity()) {
      appointmentForm.reportValidity();
      if (formStatus) {
        formStatus.textContent = 'Please complete the required fields before sending.';
        formStatus.classList.add('error');
      }
      return;
    }

    const data = new FormData(appointmentForm);
    const fullName = String(data.get('fullName') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const email = String(data.get('email') || '').trim();
    const service = String(data.get('service') || '').trim();
    const date = String(data.get('preferredDate') || '').trim();
    const time = String(data.get('preferredTime') || '').trim() || 'Any available time';
    const notes = String(data.get('notes') || '').trim();

    const message = [
      'Hello Hlungwani T.P Optometrist, I would like to request an appointment.',
      '',
      `Name: ${fullName}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      `Service: ${service}`,
      `Preferred date: ${date}`,
      `Preferred time: ${time}`,
      notes ? `Notes: ${notes}` : null,
      '',
      'Please confirm availability with me. Thank you.'
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/27761329121?text=${encodeURIComponent(message)}`;
    if (submitBooking) submitBooking.classList.add('is-sending');
    if (formStatus) formStatus.textContent = 'Opening WhatsApp with your appointment request…';

    const popup = window.open(whatsappUrl, '_blank', 'noopener');
    if (!popup) window.location.href = whatsappUrl;

    setTimeout(() => {
      if (submitBooking) submitBooking.classList.remove('is-sending');
      if (formStatus) formStatus.textContent = 'Your request is ready in WhatsApp. Send the message to complete it.';
    }, 650);
  });
}

// Site-wide Back to Top button. It is injected once so every page gets the same behaviour.
const backToTop = document.createElement('button');
backToTop.type = 'button';
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.setAttribute('title', 'Back to top');
backToTop.innerHTML = '<span aria-hidden="true">↑</span>';
document.body.appendChild(backToTop);

const backToTopStyles = document.createElement('style');
backToTopStyles.textContent = `
  .back-to-top{
    position:fixed;
    right:82px;
    bottom:21px;
    width:50px;
    height:50px;
    border:1px solid rgba(8,120,209,.16);
    border-radius:50%;
    display:grid;
    place-items:center;
    background:rgba(255,255,255,.96);
    color:#0878d1;
    box-shadow:0 10px 28px rgba(14,74,126,.16);
    font:700 25px/1 Arial,sans-serif;
    cursor:pointer;
    z-index:999;
    opacity:0;
    visibility:hidden;
    transform:translateY(12px) scale(.88);
    transition:opacity .2s ease,visibility .2s ease,transform .2s ease,background .2s ease,color .2s ease,box-shadow .2s ease;
    -webkit-tap-highlight-color:transparent;
  }
  .back-to-top.is-visible{
    opacity:1;
    visibility:visible;
    transform:translateY(0) scale(1);
  }
  .back-to-top:hover{
    background:#0878d1;
    color:#fff;
    box-shadow:0 13px 32px rgba(8,120,209,.28);
  }
  .back-to-top:focus-visible{
    outline:3px solid rgba(8,120,209,.25);
    outline-offset:3px;
  }
  @media(max-width:900px){
    .back-to-top{
      right:76px;
      bottom:20px;
      width:46px;
      height:46px;
      font-size:22px;
    }
  }
  @media(prefers-reduced-motion:reduce){
    .back-to-top{transition:none}
  }
`;
document.head.appendChild(backToTopStyles);

const updateBackToTop = () => {
  backToTop.classList.toggle('is-visible', window.scrollY > 480);
};

window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
