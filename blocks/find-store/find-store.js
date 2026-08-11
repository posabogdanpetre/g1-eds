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
    name: 'SportGuru Pipera',
    address: 'Soseaua Pipera nr. 44, Bucuresti',
    phone: '0374 992 999',
    hours: 'Luni-Vineri: 10:00-19:00, Sambata: 10:00-17:00',
  },
];

// Brand palette from the action payload.
const PALETTE = ['#6100a2', '#3de525'];

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
const ACCENT = PALETTE[0] || '#6100a2';

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

  block.textContent = '';
  render(block, stores, bridge);

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

function render(block, stores, bridge) {
  if (!stores || stores.length === 0) {
    renderEmpty(block, bridge);
    return;
  }

  const row = document.createElement('div');
  row.className = 'find-store-row';

  stores.slice(0, 2).forEach((store) => {
    const card = document.createElement('div');
    card.className = 'find-store-card';
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const head = document.createElement('div');
    head.className = 'find-store-head';

    const pin = document.createElement('div');
    pin.className = 'find-store-pin';
    pin.appendChild(pinIcon(theme?.fg ?? '#fff'));
    head.appendChild(pin);

    const name = document.createElement('h3');
    name.className = 'find-store-name';
    name.textContent = store.name || '';
    head.appendChild(name);
    card.appendChild(head);

    if (store.address) {
      const address = document.createElement('p');
      address.className = 'find-store-address';
      address.textContent = store.address;
      card.appendChild(address);
    }

    if (store.phone) {
      const phone = document.createElement('a');
      phone.className = 'find-store-phone';
      phone.href = `tel:${store.phone.replace(/\s+/g, '')}`;
      phone.textContent = store.phone;
      phone.style.color = ACCENT === theme?.bg ? '#fff' : PALETTE[1] || ACCENT;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('p');
      hours.className = 'find-store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    const btn = document.createElement('button');
    btn.className = 'find-store-cta';
    btn.textContent = 'Detalii magazin';
    btn.style.background = ACCENT;
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${store.name} store`);
      });
    }
    card.appendChild(btn);

    row.appendChild(card);
  });

  block.appendChild(row);
}

function renderEmpty(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-store-empty';
  card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

  const pin = document.createElement('div');
  pin.className = 'find-store-empty-pin';
  pin.appendChild(pinIcon(theme?.fg ?? '#fff'));
  card.appendChild(pin);

  const heading = document.createElement('h3');
  heading.className = 'find-store-empty-title';
  heading.textContent = 'Gaseste un magazin';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.className = 'find-store-input';
  input.type = 'text';
  input.placeholder = 'Introdu orasul...';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'find-store-cta find-store-cta-block';
  btn.textContent = 'Cauta magazin';
  btn.style.background = ACCENT;
  const submit = () => {
    const val = input.value.trim();
    if (bridge && val) bridge.sendMessage(`Find a SportGuru store in ${val}`);
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  card.appendChild(btn);

  block.appendChild(card);
}
