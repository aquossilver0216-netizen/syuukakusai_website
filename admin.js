const storageKey = 'harvestCrowdStatus';
const adminSessionKey = 'harvestAdminUnlocked';
const adminPasswordHash = '03332a6b53fdb131d91071c14c41d914ac5c2f8c9b5e96867a37084a169462be';
const adminGate = document.querySelector('#admin-gate');
const adminContent = document.querySelector('#admin-content');
const loginForm = document.querySelector('#admin-login');
const passwordInput = document.querySelector('#admin-password');
const authMessage = document.querySelector('#admin-auth-message');
const lockButton = document.querySelector('#admin-lock');

const readUnlockState = () => {
  try { return sessionStorage.getItem(adminSessionKey) === '1'; } catch { return false; }
};
const setUnlockState = unlocked => {
  if (adminGate) adminGate.hidden = unlocked;
  if (adminContent) adminContent.hidden = !unlocked;
};
const hashPassword = async password => {
  if (!window.crypto?.subtle || typeof TextEncoder === 'undefined') return null;
  const bytes = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
};

setUnlockState(readUnlockState());
loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!passwordInput || !authMessage) return;
  authMessage.textContent = '確認中…';
  try {
    const hash = await hashPassword(passwordInput.value);
    if (hash === adminPasswordHash) {
      try { sessionStorage.setItem(adminSessionKey, '1'); } catch { /* Keep this tab unlocked if storage is unavailable. */ }
      passwordInput.value = '';
      authMessage.textContent = '';
      setUnlockState(true);
    } else if (!hash) {
      authMessage.textContent = 'このブラウザでは認証を利用できません。HTTPSで開いてください。';
    } else {
      authMessage.textContent = 'パスワードが違います。';
      passwordInput.select();
    }
  } catch {
    authMessage.textContent = '認証に失敗しました。ページを再読み込みしてください。';
  }
});
lockButton?.addEventListener('click', () => {
  try { sessionStorage.removeItem(adminSessionKey); } catch { /* Ignore unavailable session storage. */ }
  setUnlockState(false);
  passwordInput?.focus();
});

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
