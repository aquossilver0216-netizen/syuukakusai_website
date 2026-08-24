document.documentElement.classList.add('js-enabled');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

const countdown = document.querySelector('#countdown');
const updateCountdown = () => {
  if (!countdown) return;
  const difference = new Date('2026-10-31T09:00:00+09:00').getTime() - Date.now();
  if (difference <= 0) { countdown.textContent = 'NOW OPEN'; return; }
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor(difference / 3600000) % 24;
  const minutes = Math.floor(difference / 60000) % 60;
  const seconds = Math.floor(difference / 1000) % 60;
  countdown.textContent = `${String(days).padStart(2, '0')} DAYS ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
updateCountdown();
setInterval(updateCountdown, 1000);

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

const projectResults = [...document.querySelectorAll('.project-result')];
const projectSearch = document.querySelector('#project-search');
const projectFilters = [...document.querySelectorAll('.project-filter')];
const projectCount = document.querySelector('#project-count');
const projectEmpty = document.querySelector('#project-empty');
let activeProjectFilter = 'all';
const filterProjects = () => {
  const query = (projectSearch?.value || '').trim().toLowerCase();
  let visible = 0;
  projectResults.forEach(card => {
    const matchesFilter = activeProjectFilter === 'all' || card.dataset.category === activeProjectFilter;
    const matchesQuery = !query || (card.dataset.search || '').toLowerCase().includes(query);
    card.hidden = !(matchesFilter && matchesQuery);
    if (!card.hidden) visible += 1;
  });
  if (projectCount) projectCount.textContent = `${visible} PROJECT${visible === 1 ? '' : 'S'}`;
  if (projectEmpty) projectEmpty.hidden = visible !== 0;
};
projectFilters.forEach(button => button.addEventListener('click', () => {
  activeProjectFilter = button.dataset.filter || 'all';
  projectFilters.forEach(item => item.classList.toggle('active', item === button));
  filterProjects();
}));
projectSearch?.addEventListener('input', filterProjects);
filterProjects();

const roomData = {
  gate: { title: '正門・受付', description: '正門から入場受付へ。まずはここでパンフレットと会場案内を受け取れます。' },
  gym: { title: '体育館', description: 'ステージ企画の会場です。開始前後は混雑が予想されるため、スタッフの案内に従ってください。' },
  central: { title: '中央・理科棟', description: '展示や体験企画をめぐるエリア。中央・理科・文化棟マップで位置を確認できます。' },
  hr: { title: 'HR棟 1/2F', description: '各教室の企画を探せるフロアです。教室名や企画は決まり次第、検索欄に追加します。' },
  hr34: { title: 'HR棟 3/4F', description: 'HR棟の上階フロアです。階段や通路では立ち止まらず、譲り合ってお進みください。' },
  yard: { title: '中庭・模擬店', description: 'フードやドリンクが集まる屋外エリア。混雑状況を確認してから向かえます。' },
  media: { title: 'メディア・光彩館', description: 'ホールイベントや発表の会場です。メディア・光彩館マップで入口を確認できます。' }
};
const roomButtons = [...document.querySelectorAll('.room-button')];
const roomTitle = document.querySelector('#room-picker-title');
const roomNumber = document.querySelector('#room-number');
const roomDescription = document.querySelector('#room-description');
const selectRoom = button => {
  const data = roomData[button.dataset.room];
  if (!data) return;
  roomButtons.forEach(item => item.classList.toggle('active', item === button));
  if (roomTitle) roomTitle.textContent = data.title;
  if (roomNumber) roomNumber.textContent = `AREA ${String(button.querySelector('span')?.textContent || '').padStart(2, '0')}`;
  if (roomDescription) roomDescription.textContent = data.description;
  const mapTab = document.querySelector(`.map-tab[data-map="${button.dataset.mapTarget}"]`);
  if (mapTab && !mapTab.classList.contains('active')) mapTab.click();
};
roomButtons.forEach(button => button.addEventListener('click', () => selectRoom(button)));

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

const photoButtons = [...document.querySelectorAll('.gallery-card button[data-photo]')];
const lightbox = document.querySelector('#photo-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
let currentPhoto = 0;
const showPhoto = index => {
  if (!lightbox || !photoButtons.length) return;
  currentPhoto = (index + photoButtons.length) % photoButtons.length;
  const source = photoButtons[currentPhoto].querySelector('img');
  lightboxImage.src = source.src;
  lightboxImage.alt = source.alt;
  lightboxCaption.textContent = photoButtons[currentPhoto].closest('.gallery-card').querySelector('figcaption strong').textContent;
  if (!lightbox.open) lightbox.showModal();
};
photoButtons.forEach((button, index) => button.addEventListener('click', () => showPhoto(index)));
document.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox-arrow--prev')?.addEventListener('click', () => showPhoto(currentPhoto - 1));
document.querySelector('.lightbox-arrow--next')?.addEventListener('click', () => showPhoto(currentPhoto + 1));
lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
document.addEventListener('keydown', event => {
  if (!lightbox?.open) return;
  if (event.key === 'Escape') lightbox.close();
  if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
  if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
});

const crowdRows = [...document.querySelectorAll('[data-crowd-key]')];
let crowdStatus = {};
try { crowdStatus = JSON.parse(localStorage.getItem('harvestCrowdStatus') || '{}'); } catch { crowdStatus = {}; }
const sharedCrowd = new URLSearchParams(window.location.search).get('crowd');
if (sharedCrowd) {
  try {
    const sharedStatus = JSON.parse(sharedCrowd);
    if (sharedStatus && typeof sharedStatus === 'object') crowdStatus = sharedStatus;
  } catch { /* Ignore malformed share links and keep local status. */ }
}
crowdRows.forEach(row => {
  const value = crowdStatus[row.dataset.crowdKey];
  if (value) { row.querySelector('b').textContent = value; row.dataset.status = value; }
});

const crowdSource = document.querySelector('#crowd-source');
if (sharedCrowd && crowdSource) crowdSource.textContent = '共有リンクの状態を表示中（スナップショット）';

const crowdShareUrl = () => {
  const status = Object.fromEntries(crowdRows.map(row => [row.dataset.crowdKey, row.querySelector('b')?.textContent || 'COMING SOON']));
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('crowd', JSON.stringify(status));
  url.hash = 'crowd';
  return url.toString();
};
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
const publicShareButton = document.querySelector('#share-crowd-public');
publicShareButton?.addEventListener('click', async () => {
  const url = crowdShareUrl();
  const copied = await copyText(url);
  if (copied) {
    publicShareButton.textContent = '共有リンクをコピーしました ✓';
    window.setTimeout(() => { publicShareButton.textContent = '混雑状況を共有 ↗'; }, 2600);
  } else {
    window.prompt('このリンクをコピーしてください', url);
  }
});
