const sampleDialog = document.querySelector('.guide-dialog');
const sampleTabs = [...sampleDialog.querySelectorAll('[role="tab"]')];
const showSamplePage = (tab, focus = false) => {
  sampleTabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
};
document.querySelectorAll('.sample-open').forEach(button => {
  button.addEventListener('click', () => {
    showSamplePage(document.getElementById('tab-' + button.dataset.page));
    sampleDialog.showModal();
    sampleDialog.scrollTop = 0;
  });
});
sampleDialog.querySelector('.dialog-close').addEventListener('click', () => sampleDialog.close());
sampleDialog.addEventListener('click', event => {
  if (event.target !== sampleDialog) return;
  const bounds = sampleDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) sampleDialog.close();
});
sampleTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showSamplePage(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % sampleTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + sampleTabs.length) % sampleTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = sampleTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      showSamplePage(sampleTabs[next], true);
    }
  });
});
document.querySelector('.copy-message').addEventListener('click', async () => {
  const message = 'START — I’m interested in your candle-making PDF guide and 1:1 guidance. Could you share what each includes, pricing, PDF delivery, and how to arrange 1:1 guidance?';
  const status = document.querySelector('.copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(message);
    status.textContent = 'Copied. Paste this message into Instagram.';
  } catch {
    status.textContent = message;
    const range = document.createRange();
    range.selectNodeContents(status);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
});
