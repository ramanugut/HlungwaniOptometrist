const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '✕' : '☰';
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });
}

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
  if (originalSrc && assetAliases[originalSrc]) {
    img.setAttribute('src', assetAliases[originalSrc]);
  }
});

// Use the logo icon as the browser tab icon on every page.
if (!document.querySelector('link[rel="icon"]')) {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = 'assets/logo-icon.png';
  document.head.appendChild(favicon);
}

// Small styles used only for the wired image panels below.
const wiredImageStyles = document.createElement('style');
wiredImageStyles.textContent = `
  .wired-photo-panel{position:relative!important;display:block!important;background:#eaf5ff!important;overflow:hidden!important}
  .wired-photo-panel .wired-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
  .service-detail-thumb{width:74px;height:74px;border-radius:20px;object-fit:cover;border:1px solid #d1e8f8;background:#eef7ff}
  .services-photo-strip{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:22px;align-items:center;margin:0 0 26px;background:#fff;border:1px solid #dcebf6;border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(17,82,138,.06)}
  .services-photo-strip img{width:100%;height:260px;object-fit:cover}
  .services-photo-strip div{padding:26px 28px 26px 6px}
  .services-photo-strip h3{margin:0 0 8px;color:#0b4f97;font-size:26px}
  .services-photo-strip p{margin:0;color:#63758d;line-height:1.65}
  .appointment-art.appointment-art-photo{right:0;top:0;bottom:0;width:43%;height:100%;font-size:0;transform:none;overflow:hidden;opacity:.62}
  .appointment-art.appointment-art-photo img{width:100%;height:100%;object-fit:cover;object-position:center}
  .booking-brand-art{display:block;width:min(260px,78%);margin:24px auto 0;border-radius:22px;box-shadow:0 12px 32px rgba(5,73,142,.16)}
  @media(max-width:900px){.service-detail-thumb{width:58px;height:58px;border-radius:15px}.services-photo-strip{grid-template-columns:1fr}.services-photo-strip img{height:220px}.services-photo-strip div{padding:0 22px 22px}.booking-brand-art{width:min(220px,65%)}}
  @media(max-width:640px){.services-photo-strip{border-radius:18px;margin-bottom:18px}.services-photo-strip img{height:180px}.services-photo-strip div{padding:0 18px 18px}.services-photo-strip h3{font-size:21px}.appointment-art.appointment-art-photo{display:none}.booking-brand-art{width:min(190px,62%);margin-top:18px}}
`;
document.head.appendChild(wiredImageStyles);

// Use the general eyewear photo in the home appointment panel instead of an emoji.
const appointmentArt = document.querySelector('.appointment-art');
if (appointmentArt) {
  appointmentArt.classList.add('appointment-art-photo');
  appointmentArt.innerHTML = '<img src="assets/eyewear-store.png" alt="Eyewear selection" loading="lazy">';
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// About page: use the actual consultation image instead of the CSS eye placeholder.
if (currentPage === 'about.html') {
  const visualPanel = document.querySelector('.visual-panel');
  if (visualPanel) {
    visualPanel.classList.add('wired-photo-panel');
    visualPanel.innerHTML = '<img class="wired-photo" src="assets/consultation.png" alt="Optometrist consultation" loading="lazy">';
  }
}

// Eye conditions page: show the real eye-exam close-up in the information section.
if (currentPage === 'conditions.html') {
  const visualPanel = document.querySelector('.visual-panel');
  if (visualPanel) {
    visualPanel.classList.add('wired-photo-panel');
    visualPanel.innerHTML = '<img class="wired-photo" src="assets/service-eye-exam-closeup.png" alt="Close-up eye examination" loading="lazy">';
  }
}

// Services page: use the uploaded service photos in the matching service cards.
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
    icon.replaceWith(img);
  });

  // The remaining eyewear-store photo is used as a general eyewear visual rather than mislabelling it as sunglasses.
  const serviceGrid = document.querySelector('.service-detail-grid');
  if (serviceGrid && !document.querySelector('.services-photo-strip')) {
    const strip = document.createElement('div');
    strip.className = 'services-photo-strip';
    strip.innerHTML = '<img src="assets/eyewear-store.png" alt="Eyewear frames in an optometry store" loading="lazy"><div><h3>Eyewear for everyday life</h3><p>Explore frames and lenses with practical guidance so you can choose eyewear that feels comfortable and suits your daily needs.</p></div>';
    serviceGrid.parentNode.insertBefore(strip, serviceGrid);
  }
}

// Appointment page: use the full brand artwork as a subtle finishing touch in the booking guide.
if (currentPage === 'appointment.html') {
  const bookingIntro = document.querySelector('.booking-intro');
  if (bookingIntro && !bookingIntro.querySelector('.booking-brand-art')) {
    const art = document.createElement('img');
    art.className = 'booking-brand-art';
    art.src = 'assets/logo-full.png';
    art.alt = 'Hlungwani T.P Optometrist';
    art.loading = 'lazy';
    bookingIntro.appendChild(art);
  }
}

// Local assets fail gracefully if image files are missing or renamed.
document.querySelectorAll('.local-asset').forEach((img) => {
  img.addEventListener('error', () => {
    const fallback = img.dataset.fallback;
    if (fallback && img.src !== fallback) {
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
  setTimeout(() => pageLoader.remove(), 350);
};

if (document.readyState === 'complete') {
  setTimeout(hideLoader, 180);
} else {
  window.addEventListener('load', () => setTimeout(hideLoader, 120), { once: true });
  setTimeout(hideLoader, 1100);
}

// Smooth reveals, kept small for performance and disabled for reduced-motion users.
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
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Home-page hash navigation support, if hash links are ever used again.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
if (navLinks.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => navObserver.observe(section));
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

// Preselect a service when coming from a service link such as appointment.html?service=Contact%20Lenses.
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
    }, 700);
  });
}
