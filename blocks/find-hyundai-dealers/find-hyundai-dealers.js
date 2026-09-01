// codegen:layout-pattern=store-locator
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { dealer_id: 'dalton-national-city', dealer_name: 'Dalton Hyundai National City', address: '3150 National City Blvd., National City, CA 91950', distance_miles: 5.6, phone: '(619) 474-5502', capabilities: ['New Vehicle Sales', 'Showroom', 'Service Center'], hours_summary: 'Mon-Sat 9:00 AM - 8:00 PM; Sun 10:00 AM - 6:00 PM', directions_url: 'https://www.google.com/maps/dir/?api=1&destination=3150+National+City+Blvd+National+City+CA+91950', dealer_url: 'https://www.hyundaiusa.com/us/en/dealer-locator', latitude: 32.655437, longitude: -117.09982 },
  { dealer_id: 'kearny-mesa', dealer_name: 'Kearny Mesa Hyundai', address: 'San Diego, CA (Kearny Mesa area)', distance_miles: 7.4, phone: null, capabilities: ['New Vehicle Sales', 'Service'], hours_summary: null, directions_url: 'https://www.google.com/maps/search/?api=1&query=Kearny+Mesa+Hyundai+San+Diego+CA', dealer_url: 'https://www.hyundaiusa.com/us/en/dealer-locator' },
  { dealer_id: 'el-cajon', dealer_name: 'Hyundai Of El Cajon', address: 'El Cajon, CA', distance_miles: 14.4, phone: null, capabilities: ['New Vehicle Sales', 'Service'], hours_summary: null, directions_url: 'https://www.google.com/maps/search/?api=1&query=Hyundai+Of+El+Cajon+CA', dealer_url: 'https://www.hyundaiusa.com/us/en/dealer-locator' },
  { dealer_id: 'poway', dealer_name: 'Pedder Hyundai Of Poway', address: 'Poway, CA', distance_miles: 18.1, phone: null, capabilities: ['New Vehicle Sales', 'Service'], hours_summary: null, directions_url: 'https://www.google.com/maps/search/?api=1&query=Pedder+Hyundai+Of+Poway+CA', dealer_url: 'https://www.hyundaiusa.com/us/en/dealer-locator' },
  { dealer_id: 'escondido', dealer_name: 'Hyundai Of Escondido', address: 'Escondido, CA', distance_miles: 29, phone: null, capabilities: ['New Vehicle Sales', 'Service'], hours_summary: null, directions_url: 'https://www.google.com/maps/search/?api=1&query=Hyundai+Of+Escondido+CA', dealer_url: 'https://www.hyundaiusa.com/us/en/dealer-locator' },
];

// Brand colors from DESIGN_TOKENS' color tier.
const PALETTE = ['#002c5e', '#2486d3', '#333333'];
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
const ACCENT = '#002c5e';
const AZURE = '#2486d3';
const AZURE_TEXT = '#6cb2ef';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const TILE_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const TILE_ATTR = 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors';

function readCoord(item) {
  const lat = Number(item.latitude ?? item.lat);
  const lng = Number(item.longitude ?? item.lng ?? item.lon);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return [lat, lng];
  }
  return null;
}

export default async function decorate(block, bridge) {
  let dealers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "find_hyundai_dealers"
      dealers = structuredContent?.dealers || [];
    }
  } else {
    dealers = SAMPLE_DATA;
  }

  block.textContent = '';

  if (bridge && bridge.hostContext?.preview !== true && (!dealers || dealers.length === 0)) {
    renderNoResults(block, bridge);
  } else {
    renderResults(block, dealers || [], bridge);
  }

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

function renderNoResults(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-hyundai-dealers-empty';
  card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'};`;

  const pin = document.createElement('div');
  pin.className = 'fhd-empty-pin';
  pin.textContent = '◎';
  card.appendChild(pin);

  const h = document.createElement('div');
  h.className = 'fhd-empty-title';
  h.textContent = 'No stores found';
  card.appendChild(h);

  const hint = document.createElement('div');
  hint.className = 'fhd-empty-hint';
  hint.textContent = 'Try another location.';
  card.appendChild(hint);

  const input = document.createElement('input');
  input.className = 'fhd-empty-input';
  input.type = 'text';
  input.placeholder = 'Enter ZIP code…';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'fhd-empty-btn';
  btn.textContent = 'Find Nearby';
  btn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val && bridge) bridge.sendMessage('Find stores near ' + val);
  });
  card.appendChild(btn);

  block.appendChild(card);
}

function renderResults(block, dealers, bridge) {
  const coordDealers = dealers.filter((d) => readCoord(d));
  const hasMap = coordDealers.length > 0;

  const wrap = document.createElement('div');
  wrap.className = 'fhd-results' + (hasMap ? '' : ' fhd-no-map');

  let mapPanel = null;
  if (hasMap) {
    mapPanel = document.createElement('div');
    mapPanel.className = 'fhd-map-panel fhd-map-fallback';
    wrap.appendChild(mapPanel);
  }

  const rail = document.createElement('div');
  rail.className = 'fhd-rail';

  const cards = [];
  const markerRefs = [];

  dealers.slice(0, 6).forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'fhd-card';
    card.tabIndex = 0;
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'};`;

    const header = document.createElement('div');
    header.className = 'fhd-card-head';

    const pin = document.createElement('div');
    pin.className = 'fhd-pin-num';
    pin.style.background = ACCENT;
    pin.textContent = String(i + 1);
    header.appendChild(pin);

    const titleWrap = document.createElement('div');
    titleWrap.className = 'fhd-title-wrap';

    const name = document.createElement('div');
    name.className = 'fhd-name';
    name.textContent = d.dealer_name || 'Hyundai Dealer';
    titleWrap.appendChild(name);

    if (Number.isFinite(Number(d.distance_miles))) {
      const dist = document.createElement('div');
      dist.className = 'fhd-dist';
      dist.textContent = `${d.distance_miles} mi away`;
      titleWrap.appendChild(dist);
    }
    header.appendChild(titleWrap);
    card.appendChild(header);

    if (d.address) {
      const addr = document.createElement('div');
      addr.className = 'fhd-addr';
      addr.textContent = d.address;
      card.appendChild(addr);
    }

    if (d.phone) {
      const phone = document.createElement('div');
      phone.className = 'fhd-phone';
      phone.style.color = AZURE_TEXT;
      phone.textContent = d.phone;
      card.appendChild(phone);
    }

    if (Array.isArray(d.capabilities) && d.capabilities.length) {
      const caps = document.createElement('div');
      caps.className = 'fhd-caps';
      d.capabilities.forEach((c) => {
        const chip = document.createElement('span');
        chip.className = 'fhd-chip';
        chip.textContent = c;
        caps.appendChild(chip);
      });
      card.appendChild(caps);
    }

    if (d.hours_summary) {
      const hours = document.createElement('div');
      hours.className = 'fhd-hours';
      hours.textContent = d.hours_summary;
      card.appendChild(hours);
    }

    const actions = document.createElement('div');
    actions.className = 'fhd-actions';

    if (d.directions_url) {
      const dir = document.createElement('button');
      dir.className = 'fhd-cta fhd-cta-primary';
      dir.style.background = ACCENT;
      dir.textContent = 'Get Directions';
      dir.addEventListener('click', (e) => { e.stopPropagation(); if (bridge) bridge.openLink(d.directions_url); });
      actions.appendChild(dir);
    }

    const inv = document.createElement('button');
    inv.className = 'fhd-cta fhd-cta-secondary';
    inv.textContent = 'Search Inventory';
    inv.addEventListener('click', (e) => { e.stopPropagation(); if (bridge) bridge.sendMessage(`Search inventory at ${d.dealer_name}`); });
    actions.appendChild(inv);

    const test = document.createElement('button');
    test.className = 'fhd-cta fhd-cta-secondary';
    test.textContent = 'Schedule Test Drive';
    test.addEventListener('click', (e) => { e.stopPropagation(); if (bridge) bridge.sendMessage(`Schedule a test drive at ${d.dealer_name}`); });
    actions.appendChild(test);

    if (d.dealer_url) {
      const web = document.createElement('button');
      web.className = 'fhd-cta fhd-cta-secondary';
      web.textContent = 'Visit Website';
      web.addEventListener('click', (e) => { e.stopPropagation(); if (bridge) bridge.openLink(d.dealer_url); });
      actions.appendChild(web);
    }

    card.appendChild(actions);

    const select = () => selectDealer(i);
    card.addEventListener('click', select);
    card.addEventListener('focusin', select);

    rail.appendChild(card);
    cards.push(card);
  });

  wrap.appendChild(rail);
  block.appendChild(wrap);

  function selectDealer(idx) {
    cards.forEach((c, ci) => c.classList.toggle('fhd-selected', ci === idx));
    const m = markerRefs[idx];
    if (m && m.setActive) m.setActive();
  }

  if (hasMap) {
    initMap(mapPanel, dealers, markerRefs, selectDealer, bridge);
  }

  // Select nearest suitable dealer by default.
  if (dealers.length) selectDealer(0);
}

function buildFallbackMap(panel, dealers, markerRefs, selectDealer) {
  panel.classList.add('fhd-map-fallback');
  panel.textContent = '';
  const pts = dealers.map((d) => ({ d, c: readCoord(d) })).filter((x) => x.c);
  if (!pts.length) return;
  const lats = pts.map((p) => p.c[0]);
  const lngs = pts.map((p) => p.c[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const spanLat = (maxLat - minLat) || 1;
  const spanLng = (maxLng - minLng) || 1;

  const grid = document.createElement('div');
  grid.className = 'fhd-grid-bg';
  panel.appendChild(grid);

  dealers.forEach((d, i) => {
    const c = readCoord(d);
    if (!c) return;
    const x = 10 + ((c[1] - minLng) / spanLng) * 80;
    const y = 90 - ((c[0] - minLat) / spanLat) * 80;
    const pin = document.createElement('button');
    pin.className = 'fhd-fallback-pin';
    pin.style.left = `${x}%`;
    pin.style.top = `${y}%`;
    pin.style.background = ACCENT;
    pin.setAttribute('aria-label', d.dealer_name || `Dealer ${i + 1}`);
    pin.textContent = String(i + 1);
    pin.addEventListener('click', () => selectDealer(i));
    panel.appendChild(pin);
    markerRefs[i] = { setActive: () => {
      panel.querySelectorAll('.fhd-fallback-pin').forEach((p) => p.classList.remove('fhd-pin-active'));
      pin.classList.add('fhd-pin-active');
    } };
  });
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) { resolve(window.L); return; }
    if (!document.querySelector('link[data-fhd-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.setAttribute('data-fhd-leaflet', '');
      document.head.appendChild(link);
    }
    const s = document.createElement('script');
    s.src = LEAFLET_JS;
    s.onload = () => resolve(window.L);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function initMap(panel, dealers, markerRefs, selectDealer, bridge) {
  // Fallback first so a map surface always exists without network.
  buildFallbackMap(panel, dealers, markerRefs, selectDealer);

  loadLeaflet().then((L) => {
    if (!L) return;
    panel.classList.remove('fhd-map-fallback');
    panel.textContent = '';
    const map = L.map(panel, { attributionControl: true, zoomControl: true });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxNativeZoom: 16, maxZoom: 18, detectRetina: false }).addTo(map);

    const pts = dealers.map((d, i) => ({ i, c: readCoord(d) })).filter((x) => x.c);
    const bounds = L.latLngBounds(pts.map((p) => p.c));
    if (pts.length === 1) map.setView(pts[0].c, 12);
    else map.fitBounds(bounds, { padding: [24, 24] });

    pts.forEach(({ i, c }) => {
      const el = document.createElement('div');
      el.className = 'fhd-leaflet-pin';
      el.style.background = ACCENT;
      el.textContent = String(i + 1);
      const icon = L.divIcon({ className: 'fhd-leaflet-pin-wrap', html: '' , iconSize: [28, 28] });
      const marker = L.marker(c, { icon, riseOnHover: true }).addTo(map);
      const node = marker.getElement();
      if (node) { node.textContent = ''; node.appendChild(el); }
      marker.on('click', () => selectDealer(i));
      markerRefs[i] = { setActive: () => {
        panel.querySelectorAll('.fhd-leaflet-pin').forEach((p) => p.classList.remove('fhd-pin-active'));
        el.classList.add('fhd-pin-active');
        map.panTo(c);
      } };
    });

    const invalidate = () => map.invalidateSize();
    [100, 300, 600].forEach((t) => setTimeout(invalidate, t));
    if (window.ResizeObserver) new ResizeObserver(invalidate).observe(panel);
  }).catch(() => { /* fallback panel already rendered */ });
}
