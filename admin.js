const storageKey = 'harvestCrowdStatus';
const form = document.querySelector('#crowd-form');
const message = document.querySelector('#admin-message');
const shareButton = document.querySelector('#share-crowd');
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { saved = {}; }

Object.entries(saved).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  localStorage.setItem(storageKey, JSON.stringify(data));
  message.textContent = '保存しました。公開サイトを再読み込みすると反映されます。';
});
form.addEventListener('reset', () => { localStorage.removeItem(storageKey); message.textContent = 'COMING SOON に戻しました。'; });

const copyText = async text => {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* Fall through to the legacy method. */ }
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { copied = false; }
  input.remove();
  return copied;
};
shareButton?.addEventListener('click', async () => {
  const data = Object.fromEntries(new FormData(form));
  localStorage.setItem(storageKey, JSON.stringify(data));
  const url = new URL('index.html', window.location.href);
  url.searchParams.set('crowd', JSON.stringify(data));
  url.hash = 'crowd';
  const copied = await copyText(url.toString());
  message.textContent = copied ? '共有リンクをコピーしました。来場者へ送れます。' : url.toString();
});
