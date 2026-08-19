// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    store_id: 'sg-unirii',
    name: 'SportGuru Unirii',
    full_address: 'Bulevardul Unirii nr. 69',
    city: 'Bucuresti',
    phone: '0374 050 029',
    opening_hours: 'Luni-Vineri: 10:00-20:00; Sambata: 10:00-17:00',
    available_services: 'Product consultation, Order pickup, Bicycle service',
    pickup_available: 'true',
    directions_url: 'https://g.page/Sport-Guru-Unirii-69?share',
  },
  {
    store_id: 'sg-pipera',
    name: 'SportGuru Pipera',
    full_address: 'Soseaua Pipera nr. 44',
    city: 'Bucuresti',
    phone: '0374 992 999',
    opening_hours: 'Luni-Vineri: 10:00-19:00; Sambata: 10:00-17:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://g.page/Sport-Guru-Pipera-44?share',
  },
  {
    store_id: 'sg-plaza',
    name: 'SportGuru Plaza Romania',
    full_address: 'Bd. Timisoara 26 - Plaza Romania',
    city: 'Bucuresti',
    phone: '0374 056 900',
    opening_hours: 'Luni-Duminica: 10:00-22:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://www.google.com/maps/place/Sport+Guru+Mall+Plaza+Romania',
  },
  {
    store_id: 'sg-baneasa',
    name: 'SportGuru Baneasa',
    full_address: 'Sos. Bucuresti-Ploiesti 42D, Baneasa Shopping City',
    city: 'Bucuresti',
    phone: '0374 024 024',
    opening_hours: 'Luni-Duminica: 10:00-22:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://maps.app.goo.gl/R9hgWSekXzYdaY5S7',
  },
  {
    store_id: 'sg-cluj',
    name: 'SportGuru Cluj',
    full_address: 'Strada Ploiesti nr. 39-45',
    city: 'Cluj',
    phone: '0374 027 028',
    opening_hours: 'Luni-Vineri: 10:00-19:00; Sambata: 09:00-16:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://g.page/Sport-Guru-Cluj-Ploiesti-39-45?share',
  },
  {
    store_id: 'sg-brasov',
    name: 'SportGuru Brasov',
    full_address: 'Str. Zaharia Stancu 1, Coresi Shopping Resort',
    city: 'Brasov',
    phone: '0374 800 300',
    opening_hours: 'Luni-Vineri: 10:00-21:00; Sambata-Duminica: 10:00-20:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://g.page/coresi-shopping-resort?share',
  },
  {
    store_id: 'sg-timisoara',
    name: 'SportGuru Timisoara',
    full_address: 'Pta Consiliul Europei 2, Iulius Mall',
    city: 'Timisoara',
    phone: '0374 670 000',
    opening_hours: 'Luni-Duminica: 10:00-22:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://maps.app.goo.gl/qNnLVYLNzYVnztMHA',
  },
  {
    store_id: 'sg-iasi',
    name: 'SportGuru Iasi',
    full_address: 'Palas Shopping Street - Strada Palat nr. 3C, Cladire E3',
    city: 'Iasi',
    phone: '0374 026 026',
    opening_hours: 'Luni-Vineri: 10:00-20:00; Sambata: 10:00-18:00',
    available_services: 'Product consultation, Order pickup',
    pickup_available: 'true',
    directions_url: 'https://maps.app.goo.gl/sJeaRtUncb1FEoZz8',
  },
];

// Brand palette from the action payload.
const PALETTE = ['#6100A2', '#141414', '#CC0000', '#FFFFFF', '#57575A'];

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
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#6100A2';

function toServiceList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

function isPickup(value) {
  return value === true || value === 'true';
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
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store_or_service_center"
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
  const cardStyle = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (!stores || stores.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'sl-empty';
    empty.style.cssText = cardStyle;

    const pin = document.createElement('div');
    pin.className = 'sl-empty-pin';
    pin.textContent = '📍';
    empty.appendChild(pin);

    const h = document.createElement('div');
    h.className = 'sl-empty-title';
    h.textContent = 'Find a store near you';
    empty.appendChild(h);

    const inputRow = document.createElement('div');
    inputRow.className = 'sl-empty-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'sl-input';
    input.placeholder = 'Enter ZIP code...';
    inputRow.appendChild(input);

    const searchBtn = document.createElement('button');
    searchBtn.className = 'sl-search-btn';
    searchBtn.textContent = 'Search';
    searchBtn.style.cssText = `background:#fff;color:${theme?.bg ?? '#1a1a1a'};`;
    if (bridge) {
      searchBtn.addEventListener('click', () => {
        const q = input.value.trim();
        bridge.sendMessage(q ? `Find a SportGuru store near ${q}` : 'Find a SportGuru store near me');
      });
    }
    inputRow.appendChild(searchBtn);
    empty.appendChild(inputRow);

    block.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'sl-list';

  stores.slice(0, 2).forEach((store) => {
    const card = document.createElement('div');
    card.className = 'sl-card';
    card.style.cssText = cardStyle;

    const head = document.createElement('div');
    head.className = 'sl-card-head';

    const pin = document.createElement('div');
    pin.className = 'sl-pin';
    pin.textContent = '📍';
    head.appendChild(pin);

    const headText = document.createElement('div');
    headText.className = 'sl-head-text';

    const name = document.createElement('div');
    name.className = 'sl-name';
    name.textContent = store.name || '';
    headText.appendChild(name);

    const addr = document.createElement('div');
    addr.className = 'sl-addr';
    addr.textContent = [store.full_address, store.city].filter(Boolean).join(', ');
    headText.appendChild(addr);

    head.appendChild(headText);
    card.appendChild(head);

    const meta = document.createElement('div');
    meta.className = 'sl-meta';

    if (store.opening_hours) {
      const hours = document.createElement('div');
      hours.className = 'sl-hours';
      hours.textContent = store.opening_hours;
      meta.appendChild(hours);
    }
    if (store.phone) {
      const phone = document.createElement('div');
      phone.className = 'sl-phone';
      phone.textContent = store.phone;
      meta.appendChild(phone);
    }
    card.appendChild(meta);

    const services = toServiceList(store.available_services);
    if (isPickup(store.pickup_available) && !services.some((s) => /pickup|collect/i.test(s))) {
      services.push('Order pickup');
    }
    if (services.length) {
      const chips = document.createElement('div');
      chips.className = 'sl-chips';
      services.forEach((svc) => {
        const chip = document.createElement('span');
        chip.className = 'sl-chip';
        chip.textContent = svc;
        chips.appendChild(chip);
      });
      card.appendChild(chips);
    }

    const actions = document.createElement('div');
    actions.className = 'sl-actions';

    const dirBtn = document.createElement('button');
    dirBtn.className = 'sl-btn sl-btn-primary';
    dirBtn.textContent = 'Get Directions';
    dirBtn.style.cssText = `background:#fff;color:${theme?.bg ?? '#1a1a1a'};`;
    if (bridge && store.directions_url) {
      dirBtn.addEventListener('click', () => bridge.openLink(store.directions_url));
    }
    actions.appendChild(dirBtn);

    const callBtn = document.createElement('button');
    callBtn.className = 'sl-btn sl-btn-secondary';
    callBtn.textContent = 'Call Store';
    if (bridge) {
      callBtn.addEventListener('click', () => bridge.sendMessage(`What is the phone number for ${store.name}?`));
    }
    actions.appendChild(callBtn);

    const svcBtn = document.createElement('button');
    svcBtn.className = 'sl-btn sl-btn-secondary';
    svcBtn.textContent = 'Request Service';
    if (bridge) {
      svcBtn.addEventListener('click', () => bridge.sendMessage(`What services are available at ${store.name}?`));
    }
    actions.appendChild(svcBtn);

    card.appendChild(actions);
    list.appendChild(card);
  });

  block.appendChild(list);
}
