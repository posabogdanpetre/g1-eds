// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'SportGuru Unirii',
    address: 'Bulevardul Unirii nr. 69, Bucuresti',
    phone: '0374 050 029',
    hours: 'Luni-Vineri: 10:00-20:00, Sambata: 10:00-17:00',
  },
  {
    name: 'SportGuru Baneasa',
    address: 'Sos. Bucuresti-Ploiesti 42D, Baneasa Shopping City, Bucuresti',
    phone: '0374 024 024',
    hours: 'Luni-Duminica: 10:00-22:00',
  },
];

// Brand palette from the action payload — used to derive card background.
const PALETTE = ['#6100a2'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

function pinIcon(color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', '12'); c.setAttribute('cy', '10'); c.setAttribute('r', '3');
  svg.appendChild(p); svg.appendChild(c);
  return svg;
}

function renderStores(block, stores, bridge) {
  block.textContent = '';
  const fg = theme?.fg ?? '#fff';
  const bg = theme?.bg ?? '#1a3a5c';

  const wrap = document.createElement('div');
  wrap.className = 'find-store-wrap';

  // Search bar
  const search = document.createElement('div');
  search.className = 'find-store-search';
  search.style.cssText = `background:${bg};color:${fg}`;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-store-input';
  input.placeholder = 'Enter city…';
  input.setAttribute('aria-label', 'City');

  const searchBtn = document.createElement('button');
  searchBtn.className = 'find-store-btn';
  searchBtn.type = 'button';
  searchBtn.textContent = 'Cauta magazin';
  if (bridge) {
    searchBtn.addEventListener('click', () => {
      const v = input.value.trim();
      bridge.sendMessage(v ? `Find SportGuru stores in ${v}` : 'Find SportGuru stores near me');
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchBtn.click(); });
  }
  search.appendChild(input);
  search.appendChild(searchBtn);
  wrap.appendChild(search);

  if (!stores || stores.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'find-store-empty';
    empty.style.cssText = `background:${bg};color:${fg}`;
    const pinWrap = document.createElement('div');
    pinWrap.className = 'find-store-empty-pin';
    pinWrap.style.opacity = '0.7';
    pinWrap.appendChild(pinIcon(fg));
    const h = document.createElement('div');
    h.className = 'find-store-empty-title';
    h.textContent = 'Find a store near you';
    empty.appendChild(pinWrap);
    empty.appendChild(h);
    wrap.appendChild(empty);
    block.appendChild(wrap);
    return;
  }

  const row = document.createElement('div');
  row.className = 'find-store-row';

  stores.slice(0, 2).forEach((store) => {
    const card = document.createElement('div');
    card.className = 'find-store-card';
    card.style.cssText = `background:${bg};color:${fg}`;

    const pinCircle = document.createElement('div');
    pinCircle.className = 'find-store-pin';
    pinCircle.appendChild(pinIcon(fg));
    card.appendChild(pinCircle);

    const name = document.createElement('div');
    name.className = 'find-store-name';
    name.textContent = store.name || '';
    card.appendChild(name);

    if (store.address) {
      const addr = document.createElement('div');
      addr.className = 'find-store-address';
      addr.textContent = store.address;
      card.appendChild(addr);
    }

    if (store.phone) {
      const phone = document.createElement('div');
      phone.className = 'find-store-phone';
      phone.textContent = store.phone;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('div');
      hours.className = 'find-store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    const mapBtn = document.createElement('button');
    mapBtn.className = 'find-store-map';
    mapBtn.type = 'button';
    mapBtn.textContent = 'Vezi pe harta';
    if (bridge) {
      const q = encodeURIComponent(`${store.name || ''} ${store.address || ''}`.trim());
      mapBtn.addEventListener('click', () => {
        bridge.openLink(`https://www.google.com/maps/search/?api=1&query=${q}`);
      });
    }
    card.appendChild(mapBtn);

    row.appendChild(card);
  });

  wrap.appendChild(row);
  block.appendChild(wrap);
}

export default async function decorate(block, bridge) {
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
  } else {
    stores = SAMPLE_DATA;
  }

  renderStores(block, stores, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}
