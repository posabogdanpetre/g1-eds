// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    product_id: '391149',
    name: 'Pantofi alergare barbati Hoka Clifton 11 Wide',
    brand: 'Hoka',
    category: 'Running Shoes',
    description: 'Reliable everyday training shoe with soft compression-molded EVA cushioning, technical mesh upper and Smooth MetaRocker for easy road running.',
    current_price: 835,
    original_price: 1007,
    availability: 'In Stock',
    available_sizes: ['EU 42', 'EU 42 2/3', 'EU 43 1/3', 'EU 44', 'EU 44 2/3', 'EU 45 1/3', 'EU 46', 'EU 46 2/3', 'EU 47 1/3'],
    key_features: ['Smooth MetaRocker geometry', 'Compression-molded EVA midsole', 'Abrasion-resistant rubber outsole', 'Reflective details', 'Stack height 42mm heel / 34mm forefoot', 'Wide fit'],
    match_reason: 'Everyday cushioned road trainer in a wide fit — ideal for beginner-to-intermediate runners wanting comfort and reliability.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/4/0/403498_1_1.jpg?width=1608&height=1070&store=default&image-type=image',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-hoka-clifton-11-wide',
  },
  {
    product_id: 'sg-hoka-bondi9-m',
    name: 'Pantofi alergare barbati Hoka Bondi 9 FW 2026',
    brand: 'Hoka',
    category: 'Running Shoes',
    description: 'Max-cushion road running shoe for long-distance comfort.',
    current_price: 940,
    original_price: null,
    availability: 'In Stock',
    available_sizes: [],
    key_features: ['Maximum cushioning', 'Plush ride', 'Road running'],
    match_reason: 'Top pick for runners prioritizing maximum underfoot cushioning on long runs.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1162011-wng_1_1.jpg?width=1608&height=1070&store=default&image-type=image',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-hoka-bondi-9-fw-2026',
  },
  {
    product_id: 'sg-mizuno-horizon9-m',
    name: 'Pantofi alergare barbati Mizuno Wave Horizon 9 FW 2026',
    brand: 'Mizuno',
    category: 'Running Shoes',
    description: 'Supportive stability running shoe with Mizuno Wave technology.',
    current_price: 906.3,
    original_price: 1007,
    availability: 'In Stock',
    available_sizes: [],
    key_features: ['Wave stability plate', 'Enerzy foam cushioning', 'Support for overpronation'],
    match_reason: 'Stability trainer for intermediate runners needing extra support; currently 10% off.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_j1gc262652_11_1__1_1.jpg?width=1608&height=1070&store=default&image-type=image',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-mizuno-wave-horizon-9-fw-2026',
  },
  {
    product_id: 'sg-nike-vomero-prem-w',
    name: 'Pantofi alergare dama Nike Vomero Premium SS 2026',
    brand: 'Nike',
    category: 'Running Shoes',
    description: 'Premium max-cushion women\'s road running shoe.',
    current_price: 974,
    original_price: 1217,
    availability: 'In Stock',
    available_sizes: [],
    key_features: ['Premium cushioning', 'Breathable upper', 'Road running'],
    match_reason: 'Premium cushioned women\'s trainer, discounted 20% — strong value for daily miles.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/w/_/w_nike_vomero_premium_2__1_2.jpg?width=1608&height=1070&store=default&image-type=image',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-nike-vomero-premium-ss-2026',
  },
  {
    product_id: 'sg-adidas-evosl-m',
    name: 'Pantofi alergare barbati Adidas Adizero Evo SL FW 2026',
    brand: 'Adidas',
    category: 'Running Shoes',
    description: 'Lightweight fast-training and racing shoe from the Adizero line.',
    current_price: 660,
    original_price: 750,
    availability: 'In Stock',
    available_sizes: [],
    key_features: ['Lightweight Adizero design', 'Lightstrike Pro foam', 'Fast tempo and race'],
    match_reason: 'Lightweight, responsive shoe for tempo work and racing — suits advanced runners; 12% off.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/h/v/hv8113-600_4__1_1.jpg?width=1608&height=1070&store=default&image-type=image',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-adidas-adizero-evo-sl-fw-2026',
  },
];

// Brand palette from the action payload.
const PALETTE = ['#6100A2', '#FFFFFF', '#111111', '#F5F5F5', '#E4002B'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#2563eb';

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function formatPrice(v) {
  if (v === null || v === undefined || v === '') return '';
  return `${Number(v).toLocaleString('ro-RO')} lei`;
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
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_sports_products"
      items = structuredContent?.products || [];
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
  if (!items || items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'ssp-empty';
    empty.textContent = 'No matching products were found.';
    block.appendChild(empty);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'ssp-wrapper';

  const track = document.createElement('div');
  track.className = 'ssp-track';

  items.forEach((item, i) => {
    track.appendChild(buildCard(item, i, bridge));
  });
  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'ssp-fade';
  fade.style.background = `linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  const mkArrow = (dir, label) => {
    const b = document.createElement('button');
    b.className = `ssp-arrow ssp-arrow-${dir}`;
    b.setAttribute('aria-label', label);
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.addEventListener('click', () => {
      const card = track.querySelector('.ssp-card');
      const step = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left', 'Scroll left');
  const rightArrow = mkArrow('right', 'Scroll right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= max ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= max ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);

  const summary = document.createElement('p');
  summary.className = 'ssp-summary';
  const lead = items[0];
  summary.textContent = `Top match: ${lead.name} — ${lead.match_reason} Refine by size to confirm fit.`;
  block.appendChild(summary);
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'ssp-card';

  const imageBox = document.createElement('div');
  imageBox.className = 'ssp-img';
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
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imageBox.appendChild(img);
  } else {
    imageBox.appendChild(colorDiv());
  }

  const discounted = item.original_price && item.current_price && item.original_price > item.current_price;
  if (discounted) {
    const pct = Math.round((1 - item.current_price / item.original_price) * 100);
    const badge = document.createElement('span');
    badge.className = 'ssp-discount';
    badge.textContent = `-${pct}%`;
    imageBox.appendChild(badge);
  }
  card.appendChild(imageBox);

  const info = document.createElement('div');
  info.className = 'ssp-info';
  info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const brand = document.createElement('span');
  brand.className = 'ssp-brand';
  brand.textContent = item.brand || '';
  info.appendChild(brand);

  const title = document.createElement('h3');
  title.className = 'ssp-name';
  title.textContent = item.name || '';
  info.appendChild(title);

  const cat = document.createElement('span');
  cat.className = 'ssp-cat';
  cat.textContent = item.category || '';
  info.appendChild(cat);

  const priceRow = document.createElement('div');
  priceRow.className = 'ssp-price-row';
  const price = document.createElement('span');
  price.className = 'ssp-price';
  price.textContent = formatPrice(item.current_price);
  priceRow.appendChild(price);
  if (discounted) {
    const orig = document.createElement('span');
    orig.className = 'ssp-orig';
    orig.textContent = formatPrice(item.original_price);
    priceRow.appendChild(orig);
  }
  info.appendChild(priceRow);

  const avail = document.createElement('span');
  avail.className = 'ssp-avail';
  avail.textContent = item.availability || '';
  info.appendChild(avail);

  const cta = document.createElement('button');
  cta.className = 'ssp-cta';
  cta.textContent = 'View Details';
  if (bridge) {
    cta.addEventListener('click', () => {
      if (item.product_url) bridge.openLink(item.product_url);
      else bridge.sendMessage(`Tell me more about ${item.name}`);
    });
  }
  info.appendChild(cta);

  card.appendChild(info);
  return card;
}
