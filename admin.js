const storageKey = 'harvestCrowdStatus';
const form = document.querySelector('#crowd-form');
const message = document.querySelector('#admin-message');
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

Object.entries(saved).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  localStorage.setItem(storageKey, JSON.stringify(data));
  message.textContent = '保存しました。公開サイトを再読み込みすると反映されます。';
});
form.addEventListener('reset', () => { localStorage.removeItem(storageKey); message.textContent = 'COMING SOON に戻しました。'; });
