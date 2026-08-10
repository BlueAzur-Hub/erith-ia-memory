/*
  Rising Phoenix — Golden Axis
  Progressive enhancement only. The page remains readable without JavaScript.
*/

document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const revealItems = document.querySelectorAll('[data-reveal]');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxClose = document.querySelector('[data-lightbox-close]');

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 16);
}

function closeNavigation() {
  if (!nav || !navToggle) return;
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

function toggleNavigation() {
  if (!nav || !navToggle) return;
  const isOpen = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

function setupRevealAnimation() {
  if (!revealItems.length) return;

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

function openLightbox(button) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  if (typeof lightbox.showModal !== 'function') return;

  const source = button.dataset.lightboxSrc;
  const alt = button.dataset.lightboxAlt || '';
  if (!source) return;

  lightboxImage.src = source;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = alt;
  lightbox.showModal();
}

function closeLightbox() {
  if (!lightbox || !lightbox.open) return;
  lightbox.close();
}

updateHeaderState();
setupRevealAnimation();
window.addEventListener('scroll', updateHeaderState, { passive: true });

navToggle?.addEventListener('click', toggleNavigation);
nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) closeNavigation();
});

document.querySelectorAll('[data-lightbox-src]').forEach((button) => {
  button.addEventListener('click', () => openLightbox(button));
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeNavigation();
  closeLightbox();
});
