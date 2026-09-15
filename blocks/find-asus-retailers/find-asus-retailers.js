// codegen:layout-pattern=store-locator
// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    store_id: 'bby-1024',
    name: 'Best Buy Redmond',
    address: '15015 NE 24th St, Redmond, WA 98052',
    distance_miles: 1.4,
    latitude: 47.6289,
    longitude: -122.1381,
    phone: '+1-425-869-1220',
    hours: 'Mon–Sat 10AM–8PM, Sun 11AM–7PM',
    product_categories: ['Laptops', 'Zenbook', 'Monitors'],
    inventory_status: 'Zenbook A16 (UX3607) listed — confirm by phone',
    retailer_url: 'https://www.asus.com',
    directions_url: 'https://www.asus.com',
  },
  {
    store_id: 'mc-2087',
    name: 'Micro Center Bellevue',
    address: '1500 124th Ave NE, Bellevue, WA 98005',
    distance_miles: 4.8,
    latitude: 47.6316,
    longitude: -122.1782,
    phone: '+1-425-555-0142',
    hours: 'Mon–Sun 10AM–9PM',
    product_categories: ['Laptops', 'ROG', 'Zenbook', 'Components'],
    inventory_status: 'In stock — availability requires confirmation',
    retailer_url: 'https://www.asus.com',
    directions_url: 'https://www.asus.com',
  },
  {
    store_id: 'cst-3311',
    name: 'Costco Kirkland',
    address: '8629 120th Ave NE, Kirkland, WA 98033',
    distance_miles: 6.2,
    latitude: 47.6889,
    longitude: -122.1791,
    phone: '+1-425-555-0198',
    hours: 'Mon–Fri 10AM–8:30PM, Sat–Sun 9:30AM–6PM',
    product_categories: ['Laptops', 'Zenbook'],
    inventory_status: 'Inventory requires confirmation',
    retailer_url: 'https://www.asus.com',
    directions_url: 'https://www.asus.com',
  },
];

// Brand colors from DESIGN_TOKENS' color tier — ASUS Incisive Blue.
const PALETTE = ['#006ce1', '#00a3e7', '#ffffff', '#000000'];
const ACCENT = '#006ce1';
const MAX_STORES = 6;

function getThemedCardBg(p) {
  if (!p || !p[0]) return null;
  let hex = p[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const rl = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (rl(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (rl(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo);
  const dg = Math.round(g * lo);
  const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

// ── Map engine ─────────────────────────────────────────────────────────────
const MAP_LEAFLET_VERSION = '1.9.4';
const MAP_LEAFLET_CSS = `https://unpkg.com/leaflet@${MAP_LEAFLET_VERSION}/dist/leaflet.css`;
const MAP_LEAFLET_JS = `https://unpkg.com/leaflet@${MAP_LEAFLET_VERSION}/dist/leaflet.js`;
const MAP_TILE_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const MAP_TILE_ATTRIB = 'Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAP_TILE_MAX_NATIVE_ZOOM = 16;
const MAP_TILE_MAX_ZOOM = 18;

let __mapLeafletPromise = null;

function loadLeaflet() {
  const cssLink = document.querySelector(`link[data-leaflet="${MAP_LEAFLET_VERSION}"]`);
  if (window.L && cssLink && cssLink.dataset.loaded === '1') {
    return Promise.resolve(window.L);
  }
  if (__mapLeafletPromise) return __mapLeafletPromise;

  const cssReady = new Promise((resolve) => {
    const existing = document.querySelector(`link[data-leaflet="${MAP_LEAFLET_VERSION}"]`);
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else existing.addEventListener('load', () => { resolve(); }, { once: true });
      setTimeout(resolve, 1500);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MAP_LEAFLET_CSS;
    link.dataset.leaflet = MAP_LEAFLET_VERSION;
    link.addEventListener('load', () => { link.dataset.loaded = '1'; resolve(); }, { once: true });
    link.addEventListener('error', () => { resolve(); }, { once: true });
    document.head.appendChild(link);
    setTimeout(resolve, 1500);
  });

  const jsReady = new Promise((resolve, reject) => {
    if (window.L) { resolve(window.L); return; }
    const script = document.createElement('script');
    script.src = MAP_LEAFLET_JS;
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error('Leaflet loaded but window.L is missing'));
    };
    script.onerror = () => { reject(new Error('Failed to load Leaflet')); };
    document.head.appendChild(script);
  });

  __mapLeafletPromise = Promise.all([jsReady, cssReady]).then((r) => r[0]);
  return __mapLeafletPromise;
}

function mapCoordsOf(item) {
  if (!item) return null;
  const num = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
  };
  const lat = num(item.latitude !== undefined ? item.latitude : item.lat);
  let lngRaw = item.longitude;
  if (lngRaw === undefined) lngRaw = item.lng;
  if (lngRaw === undefined) lngRaw = item.lon;
  const lng = num(lngRaw);
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function mapPointsFrom(items) {
  const out = [];
  (items || []).forEach((item, index) => {
    const c = mapCoordsOf(item);
    if (c) out.push({ item, index, lat: c.lat, lng: c.lng });
  });
  return out;
}

function mapProject(points, box) {
  const b = box || [14, 14, 72, 72];
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min.apply(null, lats);
  const maxLat = Math.max.apply(null, lats);
  const minLng = Math.min.apply(null, lngs);
  const maxLng = Math.max.apply(null, lngs);
  const spanLat = maxLat - minLat;
  const spanLng = maxLng - minLng;
  return points.map((p) => {
    const fx = spanLng > 0 ? (p.lng - minLng) / spanLng : 0.5;
    const fy = spanLat > 0 ? (maxLat - p.lat) / spanLat : 0.5;
    return { x: b[0] + fx * b[2], y: b[1] + fy * b[3] };
  });
}

function mapMakePin(point, ordinal, opts, asButton) {
  const pin = document.createElement(asButton ? 'button' : 'span');
  if (asButton) pin.type = 'button';
  const label = String(point.item[opts.labelField] || point.item.name || '').trim();
  point.label = label;
  pin.className = 'find-asus-retailers-map-pin';
  if (opts.pinColor) pin.style.background = opts.pinColor;
  const num = document.createElement('span');
  num.className = 'find-asus-retailers-map-pin-num';
  num.textContent = String(ordinal);
  pin.appendChild(num);
  if (asButton) pin.setAttribute('aria-label', label || `Location ${ordinal}`);
  return pin;
}

function mapWhenWidthStable(el) {
  return new Promise((resolve) => {
    let last = -1;
    let stable = 0;
    const started = Date.now();
    const tick = () => {
      const w = el.offsetWidth;
      if (w > 0 && w === last) stable += 1; else stable = 0;
      last = w;
      if ((w > 0 && stable >= 2) || Date.now() - started > 2000) { resolve(w); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function mapRenderFallback(container, points, onSelect, opts) {
  container.classList.add('is-fallback');
  const grid = document.createElement('div');
  grid.className = 'find-asus-retailers-map-grid';
  container.appendChild(grid);

  const projected = mapProject(points, opts.fallbackBox);
  const pins = points.map((p, i) => {
    const anchor = document.createElement('div');
    anchor.className = 'find-asus-retailers-map-anchor';
    anchor.style.left = `${projected[i].x}%`;
    anchor.style.top = `${projected[i].y}%`;
    const pin = mapMakePin(p, i + 1, opts, true);
    anchor.appendChild(pin);
    pin.addEventListener('click', () => { onSelect(p.index); });
    container.appendChild(anchor);
    return pin;
  });

  return {
    setActive(index) {
      points.forEach((p, i) => { pins[i].classList.toggle('is-active', p.index === index); });
    },
  };
}

function mapDynamicMaxZoom(bounds) {
  const lats = bounds.map((b) => b[0]);
  const lngs = bounds.map((b) => b[1]);
  const span = Math.max(
    Math.max.apply(null, lats) - Math.min.apply(null, lats),
    Math.max.apply(null, lngs) - Math.min.apply(null, lngs),
  );
  if (span > 8) return 6;
  if (span > 2) return 8;
  if (span > 0.3) return 10;
  return 11;
}

function mapRenderLeaflet(L, container, points, onSelect, opts) {
  const map = L.map(container, {
    scrollWheelZoom: false,
    zoomControl: opts.zoomControl !== false,
    attributionControl: true,
  });
  if (map.attributionControl) map.attributionControl.setPrefix('');

  const tiles = L.tileLayer(MAP_TILE_URL, {
    attribution: MAP_TILE_ATTRIB,
    detectRetina: false,
    maxNativeZoom: MAP_TILE_MAX_NATIVE_ZOOM,
    maxZoom: MAP_TILE_MAX_ZOOM,
    keepBuffer: 4,
    updateWhenIdle: false,
    updateWhenZooming: true,
  }).addTo(map);

  const bounds = points.map((p) => [p.lat, p.lng]);
  if (bounds.length === 1) {
    map.setView(bounds[0], opts.singleZoom || 11);
  } else {
    map.fitBounds(bounds, {
      paddingTopLeft: opts.fitPaddingTopLeft || [30, 30],
      paddingBottomRight: opts.fitPaddingBottomRight || [30, 30],
      maxZoom: opts.maxZoom || mapDynamicMaxZoom(bounds),
    });
  }

  points.forEach((p, i) => {
    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({ className: 'find-asus-retailers-map-marker', html: '', iconSize: null, iconAnchor: [0, 0] }),
      keyboard: true,
      riseOnHover: true,
      title: String(p.item[opts.labelField] || p.item.name || ''),
      alt: String(p.item[opts.labelField] || p.item.name || 'Location'),
    }).addTo(map);

    const pin = mapMakePin(p, i + 1, opts, false);
    p.marker = marker;
    p.pin = pin;

    const attach = () => {
      const host = marker.getElement();
      if (host) host.appendChild(pin);
    };
    marker.on('add', attach);
    attach();

    marker.on('click', () => { onSelect(p.index); });
  });

  const refresh = () => {
    map.invalidateSize(false);
    tiles.redraw();
  };
  requestAnimationFrame(refresh);
  [80, 200, 400, 800, 1400].forEach((ms) => { setTimeout(refresh, ms); });

  if (typeof ResizeObserver !== 'undefined') {
    let lastW = container.offsetWidth;
    let lastH = container.offsetHeight;
    const ro = new ResizeObserver(() => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      refresh();
    });
    ro.observe(container);
  }

  return {
    setActive(index, pan) {
      points.forEach((p) => {
        const on = p.index === index;
        if (p.pin) p.pin.classList.toggle('is-active', on);
        if (p.marker && p.marker.setZIndexOffset) p.marker.setZIndexOffset(on ? 1000 : 0);
        if (on && pan) map.panTo([p.lat, p.lng], { animate: true });
      });
    },
    invalidate: refresh,
  };
}

function mountMap(container, points, onSelect, options) {
  if (!points || !points.length) return Promise.resolve(null);
  const opts = Object.assign({ pinStyle: 'number', labelField: 'name' }, options || {});

  const loading = document.createElement('div');
  loading.className = 'find-asus-retailers-map-loading';
  loading.textContent = 'Loading map…';
  container.appendChild(loading);

  return Promise.all([loadLeaflet(), mapWhenWidthStable(container)])
    .then((r) => {
      loading.remove();
      return mapRenderLeaflet(r[0], container, points, onSelect, opts);
    })
    .catch(() => {
      container.textContent = '';
      container.classList.remove('leaflet-container');
      return mapRenderFallback(container, points, onSelect, opts);
    });
}

export default async function decorate(block, bridge) {
  let allStores = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      allStores = SAMPLE_DATA;
    } else {
      try {
        const _result = await bridge.toolResult;
        const structuredContent = _result?.structuredContent || {};
        // structuredContent.retailers — derived from action name "find_asus_retailers" (bare array outputSchema rule)
        allStores = structuredContent.retailers
          || (Array.isArray(structuredContent) ? structuredContent : null);
      } catch (e) {
        allStores = null;
      }
    }
  } else {
    allStores = SAMPLE_DATA;
  }

  function renderNoResults() {
    const empty = document.createElement('div');
    empty.className = 'find-asus-retailers-empty';

    const formCard = document.createElement('div');
    formCard.className = 'find-asus-retailers-form-card';
    formCard.style.background = theme ? theme.bg : '#1a3a5c';
    formCard.style.color = theme ? theme.fg : '#ffffff';

    const pin = document.createElement('span');
    pin.className = 'find-asus-retailers-pin';
    pin.textContent = '◎';
    formCard.appendChild(pin);

    const heading = document.createElement('h3');
    heading.className = 'find-asus-retailers-heading';
    heading.textContent = 'No stores found';
    formCard.appendChild(heading);

    const hint = document.createElement('p');
    hint.className = 'find-asus-retailers-hint';
    hint.textContent = 'Try another location.';
    formCard.appendChild(hint);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'find-asus-retailers-input';
    input.placeholder = 'Enter ZIP code…';
    input.setAttribute('aria-label', 'ZIP code');
    formCard.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'find-asus-retailers-search-btn';
    btn.textContent = 'Find Nearby';
    formCard.appendChild(btn);

    const submit = () => {
      const value = input.value.trim();
      if (!value) { input.focus(); return; }
      if (bridge && bridge.sendMessage) bridge.sendMessage(`Find stores near ${value}`);
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });

    empty.appendChild(formCard);
    block.appendChild(empty);
  }

  function renderResults(stores) {
    if (!stores || !stores.length) { renderNoResults(); return; }
    const shown = stores.slice(0, MAX_STORES);
    const points = mapPointsFrom(shown);

    const layout = document.createElement('div');
    layout.className = 'find-asus-retailers-layout';

    const mapEl = document.createElement('div');
    mapEl.className = 'find-asus-retailers-map';
    mapEl.setAttribute('role', 'application');
    mapEl.setAttribute('aria-label', `Map of ${points.length} location${points.length === 1 ? '' : 's'}`);

    const side = document.createElement('div');
    side.className = 'find-asus-retailers-side';

    const rowWrap = document.createElement('div');
    rowWrap.className = 'find-asus-retailers-row-wrap';

    const row = document.createElement('div');
    row.className = 'find-asus-retailers-row';

    let select;

    const cards = shown.map((store, i) => {
      const card = document.createElement('div');
      card.className = 'find-asus-retailers-store-card';
      card.tabIndex = 0;
      card.style.background = theme ? theme.bg : '#1a3a5c';
      card.style.color = theme ? theme.fg : '#ffffff';

      const pinDiv = document.createElement('div');
      pinDiv.className = 'find-asus-retailers-store-pin';
      const pinOrdinal = points.findIndex((p) => p.index === i);
      pinDiv.textContent = pinOrdinal >= 0 ? String(pinOrdinal + 1) : '◎';
      pinDiv.style.background = pinOrdinal >= 0 ? ACCENT : 'rgba(255,255,255,0.2)';
      card.appendChild(pinDiv);

      const name = document.createElement('div');
      name.className = 'find-asus-retailers-store-name';
      name.textContent = store.name || '';
      card.appendChild(name);

      if (store.distance_miles !== undefined && store.distance_miles !== null) {
        const dist = document.createElement('div');
        dist.className = 'find-asus-retailers-store-dist';
        dist.textContent = `${store.distance_miles} mi away`;
        card.appendChild(dist);
      }

      if (store.address) {
        const addr = document.createElement('div');
        addr.className = 'find-asus-retailers-store-addr';
        addr.textContent = store.address;
        card.appendChild(addr);
      }

      if (store.phone) {
        const phone = document.createElement('div');
        phone.className = 'find-asus-retailers-store-phone';
        phone.textContent = store.phone;
        card.appendChild(phone);
      }

      if (store.hours) {
        const hours = document.createElement('div');
        hours.className = 'find-asus-retailers-store-hours';
        hours.textContent = store.hours;
        card.appendChild(hours);
      }

      if (Array.isArray(store.product_categories) && store.product_categories.length) {
        const cats = document.createElement('div');
        cats.className = 'find-asus-retailers-cats';
        store.product_categories.slice(0, 4).forEach((c) => {
          const chip = document.createElement('span');
          chip.className = 'find-asus-retailers-cat';
          chip.textContent = c;
          cats.appendChild(chip);
        });
        card.appendChild(cats);
      }

      if (store.inventory_status) {
        const inv = document.createElement('div');
        inv.className = 'find-asus-retailers-inv';
        inv.textContent = store.inventory_status;
        card.appendChild(inv);
      }

      const actions = document.createElement('div');
      actions.className = 'find-asus-retailers-actions';

      // Primary: Get Directions — prefer the directions URL, else the retailer URL.
      const dirUrl = store.directions_url || store.retailer_url;
      if (dirUrl) {
        const dirBtn = document.createElement('button');
        dirBtn.type = 'button';
        dirBtn.className = 'find-asus-retailers-cta find-asus-retailers-cta-primary';
        dirBtn.textContent = 'Get Directions';
        dirBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (bridge && bridge.openLink) bridge.openLink(dirUrl);
        });
        actions.appendChild(dirBtn);
      }

      if (store.phone) {
        const callBtn = document.createElement('button');
        callBtn.type = 'button';
        callBtn.className = 'find-asus-retailers-cta find-asus-retailers-cta-secondary';
        callBtn.textContent = 'Call Store';
        callBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (bridge && bridge.openLink) bridge.openLink(`tel:${store.phone}`);
        });
        actions.appendChild(callBtn);
      }

      if (store.retailer_url) {
        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'find-asus-retailers-cta find-asus-retailers-cta-secondary';
        viewBtn.textContent = 'View Retailer';
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (bridge && bridge.openLink) bridge.openLink(store.retailer_url);
        });
        actions.appendChild(viewBtn);
      }

      if (actions.childNodes.length) card.appendChild(actions);

      card.addEventListener('click', () => { select(i); });
      card.addEventListener('focusin', () => { select(i); });
      row.appendChild(card);
      return card;
    });

    rowWrap.appendChild(row);

    const fade = document.createElement('div');
    fade.className = 'find-asus-retailers-fade';
    fade.style.background = `linear-gradient(to right, transparent, ${(theme ? theme.bg : '#1a3a5c')}cc)`;
    rowWrap.appendChild(fade);
    side.appendChild(rowWrap);

    if (points.length) layout.appendChild(mapEl);
    layout.appendChild(side);
    block.appendChild(layout);

    let mapApi = null;
    let activeIdx = -1;

    select = function select(index) {
      if (index === activeIdx) return;
      activeIdx = index;
      cards.forEach((c, i) => { c.classList.toggle('is-selected', i === index); });
      if (mapApi) mapApi.setActive(index, true);
      const card = cards[index];
      if (card) row.scrollLeft = Math.max(0, card.offsetLeft - row.offsetLeft - 4);
    };

    if (points.length) {
      mountMap(mapEl, points, select, {
        pinStyle: 'number',
        pinColor: ACCENT,
        labelField: 'name',
        maxZoom: 13,
        singleZoom: 13,
      }).then((api) => {
        mapApi = api;
        if (api && activeIdx >= 0) api.setActive(activeIdx, false);
      });
    }

    if (cards.length) select(0);
  }

  renderResults(allStores);

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
