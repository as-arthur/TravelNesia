import { esc } from './utils.js';

export function showToast(message, type = 'info') {
  const region = document.querySelector('#toast-region');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${esc(message)}</span>`;
  region.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
