const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab, .timeline').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(tab.dataset.day).classList.add('active');
}));

document.querySelectorAll('.map-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.map-tab, .map-view').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(tab.dataset.map).classList.add('active');
}));

const locateButton = document.querySelector('#locate-me');
const locationStatus = document.querySelector('#location-status');
if (locateButton && locationStatus) {
  locateButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'このブラウザでは現在地を取得できません。';
      return;
    }
    locationStatus.textContent = '現在地を取得中…';
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      locationStatus.textContent = `現在地を取得しました（${latitude.toFixed(4)}, ${longitude.toFixed(4)}）`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank', 'noopener');
    }, () => {
      locationStatus.textContent = '位置情報の許可が必要です。ブラウザの設定を確認してください。';
    }, { enableHighAccuracy: true, timeout: 10000 });
  });
}
