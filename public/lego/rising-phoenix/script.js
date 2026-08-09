/* Rising Phoenix V7 CLEAN — progressive enhancement only */
document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxClose = document.querySelector('[data-lightbox-close]');

function updateHeader() {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
}

function closeNav() {
  if (!nav || !navToggle) return;
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

function scrollToTarget(target, behavior = 'smooth') {
  if (!target) return;
  const offset = (header ? header.offsetHeight : 0) + 26;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const selector = link.getAttribute('href');
    if (!selector || selector === '#') return;
    const target = document.querySelector(selector);
    if (!target) return;
    event.preventDefault();
    closeNav();
    scrollToTarget(target);
    history.pushState(null, '', selector);
  });
});

if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target) requestAnimationFrame(() => scrollToTarget(target, 'auto'));
}

const reveals = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  reveals.forEach(item => observer.observe(item));
} else {
  reveals.forEach(item => item.classList.add('is-visible'));
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('[data-lightbox-src]').forEach(button => {
  button.addEventListener('click', () => {
    if (!lightbox || typeof lightbox.showModal !== 'function') return;
    const src = button.dataset.lightboxSrc;
    const alt = button.dataset.lightboxAlt || '';
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = alt;
    lightbox.showModal();
  });
});

function closeLightbox() {
  if (lightbox && lightbox.open) lightbox.close();
}
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeNav(); closeLightbox(); }
});
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
