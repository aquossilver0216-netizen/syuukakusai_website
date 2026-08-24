document.documentElement.classList.add('js-enabled');
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
      document.querySelector('#google-map-card')?.classList.add('is-located');
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank', 'noopener');
    }, () => {
      locationStatus.textContent = '位置情報の許可が必要です。ブラウザの設定を確認してください。';
    }, { enableHighAccuracy: true, timeout: 10000 });
  });
}

const weatherCodes = { 0: '快晴', 1: '晴れ', 2: '一部くもり', 3: 'くもり', 45: '霧', 48: '霧', 51: '小雨', 53: '小雨', 55: '雨', 61: '雨', 63: '雨', 65: '強い雨', 71: '雪', 73: '雪', 75: '大雪', 80: 'にわか雨', 81: 'にわか雨', 82: '強いにわか雨', 95: '雷雨' };
const weatherDays = [{ id: 'weather-day1', date: '2026-10-31' }, { id: 'weather-day2', date: '2026-11-01' }];
const weatherEndpoint = 'https://api.open-meteo.com/v1/forecast?latitude=35.836&longitude=139.575&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo';
fetch(weatherEndpoint).then(response => response.ok ? response.json() : Promise.reject(new Error('weather unavailable'))).then(data => {
  weatherDays.forEach(day => {
    const target = document.getElementById(day.id);
    const index = data.daily.time.indexOf(day.date);
    if (!target) return;
    if (index === -1) {
      target.querySelector('span').textContent = '開催2週間前から予報を表示';
      return;
    }
    const code = data.daily.weather_code[index];
    target.querySelector('span').textContent = `${weatherCodes[code] || '予報あり'}　${Math.round(data.daily.temperature_2m_min[index])}° / ${Math.round(data.daily.temperature_2m_max[index])}°`;
  });
}).catch(() => document.querySelectorAll('.weather-day span').forEach(span => { span.textContent = '開催2週間前から予報を表示'; }));

const galleryImages = document.querySelectorAll('.gallery-grid img');
if ('IntersectionObserver' in window && galleryImages.length) {
  const galleryObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); galleryObserver.unobserve(entry.target); }
  }), { threshold: 0.15 });
  galleryImages.forEach(image => galleryObserver.observe(image));
} else galleryImages.forEach(image => image.classList.add('is-visible'));
