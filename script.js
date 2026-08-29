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

// Keep older page markup working after the uploaded image files were moved and renamed.
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
    '.faq-item', '.simple-cta', '.visual-panel', '.copy-block'
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
