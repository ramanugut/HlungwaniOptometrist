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

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}
