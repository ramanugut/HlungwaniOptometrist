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

// Local assets fail gracefully while GitHub image files are being changed.
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

// Fast optometry-style loader. It never blocks the page for more than a moment.
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

// Smooth, light reveal animation. Disabled automatically for reduced-motion users.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
  const revealItems = document.querySelectorAll('.service-card,.benefits-panel,.appointment-panel,.booking-intro,.booking-form-card,.about-grid>div');
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

// Active navigation state.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
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

// Clicking a service card also preselects the same service in the form.
document.querySelectorAll('.service-card > a[href="#appointment"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (!serviceSelect) return;
    const title = link.closest('.service-card')?.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim();
    const map = {
      'Comprehensive Eye Exam': 'Comprehensive Eye Exam',
      'Spectacles / Glasses': 'Spectacles / Glasses',
      'Contact Lenses': 'Contact Lenses',
      'Sunglasses': 'Sunglasses',
      'Traffic & Eye Test Certificate': 'Traffic & Eye Test Certificate',
      'Screening of Chronic Eye Conditions': 'Screening of Chronic Eye Conditions'
    };
    if (title && map[title]) serviceSelect.value = map[title];
  });
});

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
