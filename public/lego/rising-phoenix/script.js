(() => {
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav]');
  if (menu && header && nav) {
    menu.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', e => {
      if (e.target.closest('a')) {
        header.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const modal = document.querySelector('[data-lightbox-modal]');
  const modalImage = document.querySelector('[data-lightbox-image]');
  const close = document.querySelector('[data-lightbox-close]');
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-lightbox]');
    if (!trigger || !modal || !modalImage) return;
    modalImage.src = trigger.getAttribute('data-lightbox');
    modalImage.alt = trigger.querySelector('img')?.alt || 'Project photograph';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
  });
  const closeModal = () => {
    if (!modal || !modalImage) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
  };
  close?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
