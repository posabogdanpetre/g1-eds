// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    vehicle_id: 'santa-fe-hybrid',
    name: 'Santa Fe Hybrid',
    model_year: 2026,
    category: 'Midsize SUV',
    body_style: 'SUV',
    powertrain: 'Hybrid',
    starting_msrp: 36400,
    range_or_efficiency: 'EPA-estimated 36 MPG combined; 231 combined hp',
    seating_capacity: 7,
    key_features: ['Three-row seating', 'Hybrid efficiency', 'AWD available'],
    fit_reason: 'Three rows, 36 MPG combined, available AWD — well under budget.',
    detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/santa-fe-hybrid',
  },
  {
    vehicle_id: 'palisade-hybrid',
    name: 'Palisade Hybrid',
    model_year: 2027,
    category: 'Midsize Three-Row SUV',
    body_style: 'SUV',
    powertrain: 'Hybrid',
    starting_msrp: 44560,
    range_or_efficiency: 'EPA-estimated 34 MPG combined',
    seating_capacity: 8,
    key_features: ['Up to 8-passenger seating', 'Hybrid efficiency', 'Heated front, 2nd and 3rd row seats available'],
    fit_reason: 'Up to 8 seats and 34 MPG combined for roomy family trips.',
    detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid',
  },
  {
    vehicle_id: 'santa-fe',
    name: 'Santa Fe',
    model_year: 2026,
    category: 'Midsize SUV',
    body_style: 'SUV',
    powertrain: 'Gas',
    starting_msrp: 35050,
    range_or_efficiency: 'EPA-estimated fuel economy; AWD available',
    seating_capacity: 7,
    key_features: ['Three-row seating', 'Boxy adventure-ready design', 'Wireless device charging', 'H-Tex seating surfaces'],
    fit_reason: 'Three rows and boxy cargo-friendly design with available AWD.',
    detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/santa-fe',
  },
  {
    vehicle_id: 'palisade',
    name: 'Palisade',
    model_year: 2027,
    category: 'Midsize Three-Row SUV',
    body_style: 'SUV',
    powertrain: 'Gas',
    starting_msrp: 39735,
    range_or_efficiency: 'EPA-estimated fuel economy; AWD available',
    seating_capacity: 8,
    key_features: ["Up to 8-passenger seating", "2nd-row captain's chairs available", 'Heated 3rd-row seats available', 'Heated steering wheel'],
    fit_reason: 'Up to 8 passengers with flexible seating and easy cargo access.',
    detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/palisade',
  },
  {
    vehicle_id: 'tucson-hybrid',
    name: 'Tucson Hybrid',
    model_year: 2026,
    category: 'Compact SUV',
    body_style: 'SUV',
    powertrain: 'Hybrid',
    starting_msrp: 31300,
    range_or_efficiency: 'Hybrid powertrain; standard AWD',
    seating_capacity: 5,
    key_features: ['Standard HTRAC AWD', 'Hybrid efficiency', 'Highway Driving Assist'],
    fit_reason: 'Efficient hybrid with standard AWD at a low starting price.',
    detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/tucson-hybrid',
  },
];

// Brand colors from DESIGN_TOKENS' color tier.
const PALETTE = ['#002c5e', '#2486d3', '#333333'];

const CARD_COLORS = ['#002c5e', '#2486d3', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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

function formatPrice(value) {
  if (typeof value !== 'number' || isNaN(value)) return '';
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function deriveBadges(item) {
  const badges = [];
  const pt = (item.powertrain || '').toLowerCase();
  const features = (item.key_features || []).join(' ').toLowerCase();
  const eff = (item.range_or_efficiency || '').toLowerCase();
  const seats = Number(item.seating_capacity) || 0;
  if (pt.includes('plug-in')) badges.push('Plug-in Hybrid');
  else if (pt.includes('hybrid')) badges.push('Hybrid');
  else if (pt.includes('electric')) badges.push('Electric');
  if ((item.body_style || '').toLowerCase() === 'performance') badges.push('Performance');
  if (seats >= 6 || features.includes('three-row')) badges.push('Three-Row');
  if (features.includes('awd') || eff.includes('awd')) badges.push('AWD');
  return badges;
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.models — bare array outputSchema; key derived from actionName "find_matching_hyundai_models"
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const list = (items || []).slice(0, 5);

  const wrapper = document.createElement('div');
  wrapper.className = 'fmhm-wrapper';

  const track = document.createElement('div');
  track.className = 'fmhm-track';

  list.forEach((item, i) => {
    track.appendChild(buildCard(item, i, bridge));
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'fmhm-fade';
  fade.style.background = `linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'fmhm-nav fmhm-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  const rightBtn = document.createElement('button');
  rightBtn.className = 'fmhm-nav fmhm-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const scrollByCard = (dir) => {
    const card = track.querySelector('.fmhm-card');
    const amount = card ? card.offsetWidth + 16 : 236;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollByCard(idx === 0 ? -1 : 1); }
    });
  });

  const updateNav = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    leftBtn.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightBtn.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateNav);

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);
  requestAnimationFrame(updateNav);
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'fmhm-card';

  const imageBox = document.createElement('div');
  imageBox.className = 'fmhm-image';
  const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
    imageBox.appendChild(img);
  } else {
    imageBox.appendChild(colorDiv());
  }
  card.appendChild(imageBox);

  const content = document.createElement('div');
  content.className = 'fmhm-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const title = document.createElement('h3');
  title.className = 'fmhm-title';
  const yr = item.model_year ? `${item.model_year} ` : '';
  title.textContent = `${yr}${item.name || ''}`.trim();
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'fmhm-meta';
  const bits = [item.body_style, item.powertrain, item.seating_capacity ? `${item.seating_capacity} seats` : ''].filter(Boolean);
  meta.textContent = bits.join(' • ');
  content.appendChild(meta);

  const reason = document.createElement('p');
  reason.className = 'fmhm-reason';
  reason.textContent = item.fit_reason || item.range_or_efficiency || '';
  content.appendChild(reason);

  const priceRow = document.createElement('div');
  priceRow.className = 'fmhm-price-row';
  const price = document.createElement('span');
  price.className = 'fmhm-price';
  const p = formatPrice(item.starting_msrp);
  price.textContent = p ? `${p} starting` : '';
  priceRow.appendChild(price);

  const badges = deriveBadges(item);
  if (badges.length) {
    const badgeWrap = document.createElement('span');
    badgeWrap.className = 'fmhm-badges';
    badges.slice(0, 2).forEach((b) => {
      const chip = document.createElement('span');
      chip.className = 'fmhm-badge';
      chip.textContent = b;
      badgeWrap.appendChild(chip);
    });
    priceRow.appendChild(badgeWrap);
  }
  content.appendChild(priceRow);

  const actions = document.createElement('div');
  actions.className = 'fmhm-actions';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'fmhm-cta fmhm-cta-primary';
  viewBtn.textContent = 'View Model';
  viewBtn.addEventListener('click', () => {
    if (bridge && item.detail_url) bridge.openLink(item.detail_url);
  });
  actions.appendChild(viewBtn);

  const secondary = document.createElement('div');
  secondary.className = 'fmhm-actions-secondary';

  const compareBtn = document.createElement('button');
  compareBtn.className = 'fmhm-cta fmhm-cta-secondary';
  compareBtn.textContent = 'Compare Models';
  compareBtn.addEventListener('click', () => {
    if (bridge) bridge.sendMessage(`Compare ${item.name} with similar Hyundai models`);
  });
  secondary.appendChild(compareBtn);

  const inventoryBtn = document.createElement('button');
  inventoryBtn.className = 'fmhm-cta fmhm-cta-secondary';
  inventoryBtn.textContent = 'Search Local Inventory';
  inventoryBtn.addEventListener('click', () => {
    if (bridge) bridge.sendMessage(`Search local inventory for ${item.name} near 30303`);
  });
  secondary.appendChild(inventoryBtn);

  actions.appendChild(secondary);
  content.appendChild(actions);

  card.appendChild(content);
  return card;
}
