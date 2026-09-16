// codegen:layout-pattern=store-locator

// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'SportGuru Baneasa Shopping City', address: 'Sos. Bucuresti-Ploiesti nr. 42D, Baneasa Shopping City', city: 'Bucuresti', phone: '0374 024 024', hours: 'Luni-Duminica: 10:00-22:00', latitude: 44.5050775, longitude: 26.0818188 },
  { name: 'SportGuru Plaza Romania', address: 'Bd. Timisoara nr. 26, Plaza Romania', city: 'Bucuresti', phone: '0374 056 900', hours: 'Luni-Duminica: 10:00-22:00', latitude: 44.4279758, longitude: 26.0349348 },
  { name: 'SportGuru Unirii (Service)', address: 'Bulevardul Unirii nr. 69', city: 'Bucuresti', phone: '0374 050 029', hours: 'Luni-Vineri: 10:00-20:00, Sambata: 10:00-17:00', latitude: 44.4261301, longitude: 26.1254484 },
  { name: 'SportGuru Pipera', address: 'Soseaua Pipera nr. 44', city: 'Bucuresti', phone: '0374 992 999', hours: 'Luni-Vineri: 10:00-19:00, Sambata: 10:00-17:00', latitude: 44.4807056, longitude: 26.104559 },
  { name: 'SportGuru Timisoara Iulius Mall', address: 'Pta Consiliul Europei nr. 2, Iulius Mall', city: 'Timisoara', phone: '0374 670 000', hours: 'Luni-Duminica: 10:00-22:00', latitude: 45.7639754, longitude: 21.2247483 },
  { name: 'SportGuru Brasov Coresi', address: 'Str. Zaharia Stancu nr. 1, Coresi Shopping Resort', city: 'Brasov', phone: '0374 800 300', hours: 'Luni-Vineri: 10:00-21:00, Sambata-Duminica: 10:00-20:00', latitude: 45.6716696, longitude: 25.6162829 },
];

// Brand colors from DESIGN_TOKENS' color tier. getThemedCardBg() darkens PALETTE[0]
// to luminance <= 0.12 so white text has WCAG AA contrast on the card bg.
const PALETTE = ['#6100a2', '#3de525'];
const ACCENT = '#6100a2';
const MAX_STORES = 6;

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

// ── Map engine ─────────────────────────────────────────────────────────────
// Real tiles need these on the action's resource_meta.csp:
//   resourceDomains: https://unpkg.com, https://services.arcgisonline.com
//   connectDomains:  https://services.arcgisonline.com
// Nothing breaks without them — loadLeaflet() rejects and mountMap() renders
// the projected-pin fallback, which makes no network requests.
const MAP_LEAFLET_VERSION = '1.9.4';
const MAP_LEAFLET_CSS = 'https://unpkg.com/leaflet@' + MAP_LEAFLET_VERSION + '/dist/leaflet.css';
const MAP_LEAFLET_JS = 'https://unpkg.com/leaflet@' + MAP_LEAFLET_VERSION + '/dist/leaflet.js';

const MAP_TILE_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const MAP_TILE_ATTRIB = 'Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAP_TILE_MAX_NATIVE_ZOOM = 16;
const MAP_TILE_MAX_ZOOM = 18;

let __mapLeafletPromise = null;

function loadLeaflet() {
  const cssLink = document.querySelector('link[data-leaflet="' + MAP_LEAFLET_VERSION + '"]');
  if (window.L && cssLink && cssLink.dataset.loaded === '1') {
    return Promise.resolve(window.L);
  }
  if (__mapLeafletPromise) return __mapLeafletPromise;

  const cssReady = new Promise(function (resolve) {
    const existing = document.querySelector('link[data-leaflet="' + MAP_LEAFLET_VERSION + '"]');
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else existing.addEventListener('load', function () { resolve(); }, { once: true });
      setTimeout(resolve, 1500);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MAP_LEAFLET_CSS;
    link.dataset.leaflet = MAP_LEAFLET_VERSION;
    link.addEventListener('load', function () { link.dataset.loaded = '1'; resolve(); }, { once: true });
    link.addEventListener('error', function () { resolve(); }, { once: true });
    document.head.appendChild(link);
    setTimeout(resolve, 1500);
  });

  const jsReady = new Promise(function (resolve, reject) {
    if (window.L) { resolve(window.L); return; }
    const script = document.createElement('script');
    script.src = MAP_LEAFLET_JS;
    script.async = true;
    script.onload = function () {
      if (window.L) resolve(window.L);
      else reject(new Error('Leaflet loaded but window.L is missing'));
    };
    script.onerror = function () { reject(new Error('Failed to load Leaflet')); };
    document.head.appendChild(script);
  });

  __mapLeafletPromise = Promise.all([jsReady, cssReady]).then(function (r) { return r[0]; });
  return __mapLeafletPromise;
}

function mapCoordsOf(item) {
  if (!item) return null;
  const num = function (v) {
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
  return { lat: lat, lng: lng };
}

function mapPointsFrom(items) {
  const out = [];
  (items || []).forEach(function (item, index) {
    const c = mapCoordsOf(item);
    if (c) out.push({ item: item, index: index, lat: c.lat, lng: c.lng });
  });
  return out;
}

function mapProject(points, box) {
  const b = box || [14, 14, 72, 72];
  const lats = points.map(function (p) { return p.lat; });
  const lngs = points.map(function (p) { return p.lng; });
  const minLat = Math.min.apply(null, lats);
  const maxLat = Math.max.apply(null, lats);
  const minLng = Math.min.apply(null, lngs);
  const maxLng = Math.max.apply(null, lngs);
  const spanLat = maxLat - minLat;
  const spanLng = maxLng - minLng;
  return points.map(function (p) {
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
  if (opts.pinStyle === 'label' && label) {
    pin.className = 'find-store-or-service-center-map-label';
    pin.textContent = label;
  } else {
    pin.className = 'find-store-or-service-center-map-pin';
    if (opts.pinColor) pin.style.background = opts.pinColor;
    const num = document.createElement('span');
    num.className = 'find-store-or-service-center-map-pin-num';
    num.textContent = String(ordinal);
    pin.appendChild(num);
  }
  if (asButton) pin.setAttribute('aria-label', label || ('Location ' + ordinal));
  return pin;
}

function mapDemoteLabelToPin(point, ordinal, opts) {
  const pin = point.pin;
  if (!pin || !pin.classList.contains('find-store-or-service-center-map-label')) return;
  const name = pin.textContent;
  pin.textContent = '';
  pin.className = 'find-store-or-service-center-map-pin';
  if (opts.pinColor) pin.style.background = opts.pinColor;
  const num = document.createElement('span');
  num.className = 'find-store-or-service-center-map-pin-num';
  num.textContent = String(ordinal);
  pin.appendChild(num);
  pin.setAttribute('aria-label', name);
  if (point.marker && point.marker.setZIndexOffset) point.marker.setZIndexOffset(1000);
}

function mapPromoteToLabel(point) {
  const pin = point.pin;
  if (!pin || pin.classList.contains('find-store-or-service-center-map-label')) return;
  pin.textContent = point.label || '';
  pin.className = 'find-store-or-service-center-map-label';
  pin.style.background = '';
  pin.removeAttribute('aria-label');
  if (point.marker && point.marker.setZIndexOffset) point.marker.setZIndexOffset(0);
}

function mapDeclutterLabels(points, opts) {
  if (opts.pinStyle !== 'label') return;
  points.forEach(function (p) { if (p.pin) mapPromoteToLabel(p); });

  const PAD = 2;
  const overlaps = function (a, b) {
    return a.left < b.right + PAD && b.left < a.right + PAD
      && a.top < b.bottom + PAD && b.top < a.bottom + PAD;
  };
  const rectOf = function (p) {
    const r = p.pin ? p.pin.getBoundingClientRect() : null;
    return r && r.width && r.height ? r : null;
  };

  for (let pass = 0; pass < points.length + 1; pass += 1) {
    const labelled = points.filter(function (p) {
      return p.pin && p.pin.classList.contains('find-store-or-service-center-map-label');
    });
    if (labelled.length < 1) return;

    const kept = [];
    let demoted = null;
    for (let i = 0; i < labelled.length; i += 1) {
      const p = labelled[i];
      const r = rectOf(p);
      if (!r) continue;
      const hitsLabel = kept.some(function (k) { return overlaps(r, k); });
      if (hitsLabel) { demoted = p; break; }
      kept.push(r);
    }
    if (!demoted) return;
    mapDemoteLabelToPin(demoted, points.indexOf(demoted) + 1, opts);
  }
}

function mapWhenWidthStable(el) {
  return new Promise(function (resolve) {
    let last = -1;
    let stable = 0;
    const started = Date.now();
    const tick = function () {
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
  grid.className = 'find-store-or-service-center-map-grid';
  container.appendChild(grid);

  const projected = mapProject(points, opts.fallbackBox);
  const pins = points.map(function (p, i) {
    const anchor = document.createElement('div');
    anchor.className = 'find-store-or-service-center-map-anchor';
    anchor.style.left = projected[i].x + '%';
    anchor.style.top = projected[i].y + '%';
    const pin = mapMakePin(p, i + 1, opts, true);
    anchor.appendChild(pin);
    pin.addEventListener('click', function () { onSelect(p.index); });
    container.appendChild(anchor);
    return pin;
  });

  return {
    setActive: function (index) {
      points.forEach(function (p, i) { pins[i].classList.toggle('is-active', p.index === index); });
    },
  };
}

function mapDynamicMaxZoom(bounds) {
  const lats = bounds.map(function (b) { return b[0]; });
  const lngs = bounds.map(function (b) { return b[1]; });
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

  const bounds = points.map(function (p) { return [p.lat, p.lng]; });
  if (bounds.length === 1) {
    map.setView(bounds[0], opts.singleZoom || 11);
  } else {
    map.fitBounds(bounds, {
      paddingTopLeft: opts.fitPaddingTopLeft || [30, 30],
      paddingBottomRight: opts.fitPaddingBottomRight || [30, 30],
      maxZoom: opts.maxZoom || mapDynamicMaxZoom(bounds),
    });
  }

  points.forEach(function (p, i) {
    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({ className: 'find-store-or-service-center-map-marker', html: '', iconSize: null, iconAnchor: [0, 0] }),
      keyboard: true,
      riseOnHover: true,
      title: String(p.item[opts.labelField] || p.item.name || ''),
      alt: String(p.item[opts.labelField] || p.item.name || 'Location'),
    }).addTo(map);

    const pin = mapMakePin(p, i + 1, opts, false);
    p.marker = marker;
    p.pin = pin;

    const attach = function () {
      const host = marker.getElement();
      if (host) host.appendChild(pin);
    };
    marker.on('add', attach);
    attach();

    marker.on('click', function () { onSelect(p.index); });
  });

  mapDeclutterLabels(points, opts);

  map.on('zoomend', function () { mapDeclutterLabels(points, opts); });

  const refresh = function () {
    map.invalidateSize(false);
    tiles.redraw();
    mapDeclutterLabels(points, opts);
  };
  requestAnimationFrame(refresh);
  [80, 200, 400, 800, 1400].forEach(function (ms) { setTimeout(refresh, ms); });

  if (typeof ResizeObserver !== 'undefined') {
    let lastW = container.offsetWidth;
    let lastH = container.offsetHeight;
    const ro = new ResizeObserver(function () {
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
    setActive: function (index, pan) {
      points.forEach(function (p) {
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
  loading.className = 'find-store-or-service-center-map-loading';
  loading.textContent = 'Loading map…';
  container.appendChild(loading);

  return Promise.all([loadLeaflet(), mapWhenWidthStable(container)])
    .then(function (r) {
      loading.remove();
      return mapRenderLeaflet(r[0], container, points, onSelect, opts);
    })
    .catch(function () {
      container.textContent = '';
      container.classList.remove('leaflet-container');
      return mapRenderFallback(container, points, onSelect, opts);
    });
}

export default async function decorate(block, bridge) {
  // Results (map + cards) are the DEFAULT view: the user already named a location
  // when they asked the assistant, so opening on a form that asks them to retype it
  // would hide the answer behind a step they already took. The location form
  // survives only for a host run that returned NO stores.
  let allStores = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      allStores = SAMPLE_DATA;
    } else {
      try {
        const _result = await bridge.toolResult;
        // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store_or_service_center"
        const sc = _result?.structuredContent || {};
        allStores = sc.stores || (Array.isArray(sc) ? sc : null);
      } catch (e) { allStores = null; }
    }
  } else {
    allStores = SAMPLE_DATA;
  }

  function renderNoResults() {
    const empty = document.createElement('div');
    empty.className = 'find-store-or-service-center-empty';

    const formCard = document.createElement('div');
    formCard.className = 'find-store-or-service-center-form-card';
    formCard.style.background = theme ? theme.bg : '#6100a2';

    const pin = document.createElement('span');
    pin.className = 'find-store-or-service-center-pin';
    pin.textContent = '◎';
    pin.style.color = theme ? theme.fg : '#fff';
    formCard.appendChild(pin);

    const heading = document.createElement('h3');
    heading.className = 'find-store-or-service-center-heading';
    heading.textContent = 'No stores found';
    heading.style.color = theme ? theme.fg : '#fff';
    formCard.appendChild(heading);

    const hint = document.createElement('p');
    hint.className = 'find-store-or-service-center-hint';
    hint.textContent = 'Try another location.';
    hint.style.color = theme ? theme.fg : '#fff';
    formCard.appendChild(hint);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'find-store-or-service-center-input';
    input.placeholder = 'Enter ZIP code…';
    input.setAttribute('aria-label', 'ZIP code or city');
    formCard.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'find-store-or-service-center-search-btn';
    btn.textContent = 'Find Nearby';
    formCard.appendChild(btn);

    const submit = function () {
      const value = input.value.trim();
      if (!value) { input.focus(); return; }
      if (bridge && bridge.sendMessage) bridge.sendMessage('Find stores near ' + value);
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
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
    layout.className = 'find-store-or-service-center-layout';

    const mapEl = document.createElement('div');
    mapEl.className = 'find-store-or-service-center-map';
    mapEl.setAttribute('role', 'application');
    mapEl.setAttribute('aria-label', 'Map of ' + points.length + ' location' + (points.length === 1 ? '' : 's'));

    const side = document.createElement('div');
    side.className = 'find-store-or-service-center-side';

    const rowWrap = document.createElement('div');
    rowWrap.className = 'find-store-or-service-center-row-wrap';

    const row = document.createElement('div');
    row.className = 'find-store-or-service-center-row';

    const cards = shown.map(function (store, i) {
      const card = document.createElement('div');
      card.className = 'find-store-or-service-center-store-card';
      card.tabIndex = 0;
      card.style.background = theme ? theme.bg : '#6100a2';
      card.style.color = theme ? theme.fg : '#fff';

      const pinDiv = document.createElement('div');
      pinDiv.className = 'find-store-or-service-center-store-pin';
      const pinOrdinal = points.findIndex(function (p) { return p.index === i; });
      pinDiv.textContent = pinOrdinal >= 0 ? String(pinOrdinal + 1) : '◎';
      if (pinOrdinal >= 0) pinDiv.style.background = ACCENT;
      card.appendChild(pinDiv);

      const name = document.createElement('div');
      name.className = 'find-store-or-service-center-store-name';
      name.textContent = store.name || '';
      card.appendChild(name);

      if (store.address) {
        const addr = document.createElement('div');
        addr.className = 'find-store-or-service-center-store-addr';
        const parts = [store.address];
        if (store.city) parts.push(store.city);
        addr.textContent = parts.join(', ');
        card.appendChild(addr);
      }

      if (typeof store.distance_km === 'number') {
        const dist = document.createElement('div');
        dist.className = 'find-store-or-service-center-store-addr';
        dist.textContent = store.distance_km + ' km away';
        card.appendChild(dist);
      }

      if (store.phone) {
        const phone = document.createElement('div');
        phone.className = 'find-store-or-service-center-store-phone';
        phone.textContent = store.phone;
        card.appendChild(phone);
      }

      const hoursText = store.hours || (store.opening_hours && typeof store.opening_hours === 'string' ? store.opening_hours : '');
      if (hoursText) {
        const hours = document.createElement('div');
        hours.className = 'find-store-or-service-center-store-hours';
        hours.textContent = hoursText;
        card.appendChild(hours);
      }

      // Service badges — only when explicitly published on the store.
      if (Array.isArray(store.available_services) && store.available_services.length) {
        const badges = document.createElement('div');
        badges.className = 'find-store-or-service-center-badges';
        store.available_services.forEach(function (svc) {
          const chip = document.createElement('span');
          chip.className = 'find-store-or-service-center-badge';
          chip.textContent = String(svc);
          badges.appendChild(chip);
        });
        card.appendChild(badges);
      }

      // Primary CTA — Get Directions. Prefer a published directions_url; otherwise
      // hand the store back to the conversation so the assistant can route.
      const cta = document.createElement('button');
      cta.type = 'button';
      cta.className = 'find-store-or-service-center-cta';
      cta.textContent = 'Get Directions';
      cta.addEventListener('click', function (e) {
        e.stopPropagation();
        if (store.directions_url && bridge && bridge.openLink) {
          bridge.openLink(store.directions_url);
        } else if (bridge && bridge.sendMessage) {
          bridge.sendMessage('Get directions to ' + (store.name || 'this location'));
        }
      });
      card.appendChild(cta);

      card.addEventListener('click', function () { select(i); });
      card.addEventListener('focusin', function () { select(i); });
      row.appendChild(card);
      return card;
    });

    rowWrap.appendChild(row);

    const fade = document.createElement('div');
    fade.className = 'find-store-or-service-center-fade';
    fade.style.background = 'linear-gradient(to right, transparent, ' + (theme ? theme.bg : '#6100a2') + 'cc)';
    rowWrap.appendChild(fade);
    side.appendChild(rowWrap);

    if (points.length) layout.appendChild(mapEl);
    layout.appendChild(side);
    block.appendChild(layout);

    let mapApi = null;
    let activeIdx = -1;

    function select(index) {
      if (index === activeIdx) return;
      activeIdx = index;
      cards.forEach(function (c, i) { c.classList.toggle('is-selected', i === index); });
      if (mapApi) mapApi.setActive(index, true);
      const card = cards[index];
      if (card) row.scrollLeft = Math.max(0, card.offsetLeft - row.offsetLeft - 4);
    }

    if (points.length) {
      mountMap(mapEl, points, select, {
        pinStyle: 'number',
        pinColor: ACCENT,
        labelField: 'name',
        maxZoom: 13,
        singleZoom: 13,
      }).then(function (api) {
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
    const ro = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { bridge.reportSize(block.offsetWidth, block.offsetHeight); }, 150);
    });
    ro.observe(block);
  }
}
