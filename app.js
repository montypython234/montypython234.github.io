const dialog = document.querySelector('.image-dialog');
const dialogImage = dialog?.querySelector('img');
const dialogCaption = document.querySelector('#image-dialog-caption');
const closeButton = dialog?.querySelector('.dialog-close');
const originalLink = dialog?.querySelector('.dialog-original');
const header = document.querySelector('.site-header');
let opener = null;

if (header && 'ResizeObserver' in window) {
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  }).observe(header);
}

if (dialog && dialogImage && dialogCaption && closeButton && originalLink && dialog.showModal) {
  document.querySelectorAll('.zoom-button').forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', event => {
      event.preventDefault();
      opener = trigger;
      dialogImage.src = trigger.dataset.image;
      dialogImage.alt = trigger.dataset.alt;
      dialogCaption.textContent = trigger.dataset.caption;
      originalLink.href = trigger.href;
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => opener?.focus());
}
