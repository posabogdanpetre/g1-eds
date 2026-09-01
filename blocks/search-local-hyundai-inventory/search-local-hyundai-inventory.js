// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode. In production, data comes from bridge.toolResult.
const SAMPLE_DATA = [
  { vehicle_id: 'ioniq-5', name: 'IONIQ 5', model_year: 2026, category: 'Electric SUV', body_style: 'SUV', powertrain: 'Electric', starting_msrp: 35000, range_or_efficiency: 'EPA-estimated up to 318 miles range', seating_capacity: 5, key_features: ['Ultra-fast 800V charging', 'AWD available', 'Vehicle-to-Load (V2L)', 'Highway Driving Assist'], image_url: 'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-se-standard-range-rwd-digital-teal-ev-tool', detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/ioniq-5' },
  { vehicle_id: 'ioniq-5-n', name: 'IONIQ 5 N', model_year: 2026, category: 'Performance Electric SUV', body_style: 'Performance', powertrain: 'Electric', starting_msrp: 59900, range_or_efficiency: 'High-performance dual-motor EV', seating_capacity: 5, key_features: ['641 hp N Grin Boost', 'Track-capable', 'AWD', 'N e-Shift'], detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/ioniq-5-n' },
  { vehicle_id: 'ioniq-6', name: 'IONIQ 6', model_year: 2025, category: 'Electric Sedan', body_style: 'Sedan', powertrain: 'Electric', starting_msrp: 37850, detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/ioniq-6' },
  { vehicle_id: 'palisade', name: 'Palisade', model_year: 2027, category: 'Midsize Three-Row SUV', body_style: 'SUV', powertrain: 'Gas', starting_msrp: 39735, detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/palisade' },
  { vehicle_id: 'palisade-hybrid', name: 'Palisade Hybrid', model_year: 2027, category: 'Midsize Three-Row SUV', body_style: 'SUV', powertrain: 'Hybrid', starting_msrp: 44560, detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid' },
];

// Brand colors from DESIGN_TOKENS.color (Meridian Steel — deep navy + azure).
const PALETTE = ['#002c5e', '#2486d3', '#333333'];
const ACCENT = '#002c5e';
const CARD_COLORS = ['#002c5e', '#1a3a5c', '#2a1a3a', '#3a2a1a', '#1a1a3a', '#3a1a1a'];

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
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

function fmtPrice(v) {
  if (v == null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.]/g, ''));
  if (!isFinite(n) || n === 0) return '';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function priceValue(item) {
  const v = item.total_msrp != null ? item.total_msrp : item.starting_msrp;
  const n = typeof v === 'number' ? v : Number(String(v || '').replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function distanceValue(item) {
  const n = typeof item.distance_miles === 'number' ? item.distance_miles : Number(item.distance_miles);
  return isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function titleFor(item) {
  const yr = item.model_year ? `${item.model_year} ` : '';
  const model = item.model_name || item.name || 'Vehicle';
  return `${yr}${model}`.trim();
}

export default async function decorate(block, bridge) {
  let items;
  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.vehicles — bare array outputSchema; key derived from actionName "search_local_hyundai_inventory"
      items = structuredContent?.vehicles || [];
    }
  } else {
    items = SAMPLE_DATA;
  }
  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';
  let sortMode = 'distance';

  const controls = document.createElement('div');
  controls.className = 'search-local-hyundai-inventory-controls';
  const sortLabel = document.createElement('span');
  sortLabel.className = 'search-local-hyundai-inventory-sort-label';
  sortLabel.textContent = 'Sort';
  controls.appendChild(sortLabel);
  const btnDist = document.createElement('button');
  btnDist.className = 'search-local-hyundai-inventory-sort-btn is-active';
  btnDist.type = 'button';
  btnDist.textContent = 'Distance';
  const btnPrice = document.createElement('button');
  btnPrice.className = 'search-local-hyundai-inventory-sort-btn';
  btnPrice.type = 'button';
  btnPrice.textContent = 'Price';
  controls.appendChild(btnDist);
  controls.appendChild(btnPrice);
  block.appendChild(controls);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-local-hyundai-inventory-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'search-local-hyundai-inventory-arrow search-local-hyundai-inventory-arrow-left';
  btnLeft.type = 'button';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'search-local-hyundai-inventory-track-wrap';

  const track = document.createElement('div');
  track.className = 'search-local-hyundai-inventory-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'search-local-hyundai-inventory-arrow search-local-hyundai-inventory-arrow-right';
  btnRight.type = 'button';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'search-local-hyundai-inventory-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${(theme ? theme.bg : ACCENT)}dd)`;

  function specRow(labelText, valueText) {
    const row = document.createElement('div');
    row.className = 'search-local-hyundai-inventory-spec';
    const l = document.createElement('span');
    l.className = 'search-local-hyundai-inventory-spec-label';
    l.textContent = labelText;
    const v = document.createElement('span');
    v.className = 'search-local-hyundai-inventory-spec-val';
    v.textContent = valueText;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  function buildCard(item, i) {
    const card = document.createElement('div');
    card.className = 'search-local-hyundai-inventory-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'search-local-hyundai-inventory-img';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = titleFor(item);
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'search-local-hyundai-inventory-info';
    info.style.cssText = `background:${theme ? theme.bg : ACCENT};color:${theme ? theme.fg : '#fff'};`;

    const name = document.createElement('div');
    name.className = 'search-local-hyundai-inventory-name';
    name.textContent = titleFor(item);
    info.appendChild(name);

    if (item.trim_name || item.powertrain) {
      const sub = document.createElement('div');
      sub.className = 'search-local-hyundai-inventory-sub';
      sub.textContent = [item.trim_name, item.powertrain].filter(Boolean).join(' · ');
      info.appendChild(sub);
    }

    const specs = document.createElement('div');
    specs.className = 'search-local-hyundai-inventory-specs';
    if (item.drivetrain) specs.appendChild(specRow('Drivetrain', item.drivetrain));
    if (item.exterior_color) specs.appendChild(specRow('Exterior', item.exterior_color));
    if (item.interior_color) specs.appendChild(specRow('Interior', item.interior_color));
    if (item.dealer_name) specs.appendChild(specRow('Dealer', item.dealer_name));
    if (item.distance_miles != null && isFinite(distanceValue(item))) {
      specs.appendChild(specRow('Distance', `${distanceValue(item)} mi`));
    }
    if (specs.childNodes.length) info.appendChild(specs);

    const priceRow = document.createElement('div');
    priceRow.className = 'search-local-hyundai-inventory-price-row';
    const price = document.createElement('span');
    price.className = 'search-local-hyundai-inventory-price';
    const p = fmtPrice(item.total_msrp != null ? item.total_msrp : item.starting_msrp);
    price.textContent = p || 'Contact dealer';
    priceRow.appendChild(price);
    if (item.availability_status) {
      const badge = document.createElement('span');
      badge.className = 'search-local-hyundai-inventory-badge';
      badge.textContent = item.availability_status;
      priceRow.appendChild(badge);
    }
    info.appendChild(priceRow);

    if (p) {
      const note = document.createElement('div');
      note.className = 'search-local-hyundai-inventory-price-note';
      note.textContent = 'MSRP · confirm pricing with dealer';
      info.appendChild(note);
    }

    if (item.vin) {
      const details = document.createElement('details');
      details.className = 'search-local-hyundai-inventory-details';
      const summary = document.createElement('summary');
      summary.textContent = 'VIN & more';
      details.appendChild(summary);
      const vinEl = document.createElement('div');
      vinEl.className = 'search-local-hyundai-inventory-vin';
      vinEl.textContent = `VIN: ${item.vin}`;
      details.appendChild(vinEl);
      if (bridge) {
        const actions = document.createElement('div');
        actions.className = 'search-local-hyundai-inventory-actions';
        const mk = (labelText, msg) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'search-local-hyundai-inventory-action';
          b.textContent = labelText;
          b.addEventListener('click', () => bridge.sendMessage(msg));
          return b;
        };
        const nm = titleFor(item);
        const dealer = item.dealer_name ? ` at ${item.dealer_name}` : '';
        actions.appendChild(mk('Contact Dealer', `Contact the dealer${dealer} about the ${nm}.`));
        actions.appendChild(mk('Estimate Payment', `Estimate a monthly payment for the ${nm}.`));
        actions.appendChild(mk('Schedule Test Drive', `Schedule a test drive for the ${nm}${dealer}.`));
        details.appendChild(actions);
      }
      info.appendChild(details);
    }

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'search-local-hyundai-inventory-cta';
    cta.textContent = 'View Full Specs';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.detail_url) bridge.openLink(item.detail_url);
        else bridge.sendMessage(`Show me full specs for the ${titleFor(item)}.`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    return card;
  }

  function render() {
    track.textContent = '';
    const sorted = items.slice().sort((a, b) => (
      sortMode === 'price' ? priceValue(a) - priceValue(b) : distanceValue(a) - distanceValue(b)
    ));
    sorted.slice(0, 8).forEach((item, i) => track.appendChild(buildCard(item, i)));
    updateArrows();
  }

  btnDist.addEventListener('click', () => {
    sortMode = 'distance';
    btnDist.classList.add('is-active');
    btnPrice.classList.remove('is-active');
    render();
  });
  btnPrice.addEventListener('click', () => {
    sortMode = 'price';
    btnPrice.classList.add('is-active');
    btnDist.classList.remove('is-active');
    render();
  });

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);
  block.appendChild(wrapper);

  const cardWidth = 220 + 16;
  const scrollBy = (dir) => track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  btnLeft.addEventListener('click', () => scrollBy(-1));
  btnRight.addEventListener('click', () => scrollBy(1));
  [btnLeft, btnRight].forEach((btn, idx) => btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(idx === 0 ? -1 : 1); }
  }));

  function updateArrows() {
    const atStart = track.scrollLeft <= 0;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    btnLeft.style.display = atStart ? 'none' : 'flex';
    btnRight.style.display = atEnd ? 'none' : 'flex';
  }
  track.addEventListener('scroll', updateArrows);

  render();

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
