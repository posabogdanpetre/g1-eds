// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    product_id: '391149',
    name: 'Pantofi alergare barbati Hoka Clifton 11 Wide',
    brand: 'Hoka',
    sport: 'Running',
    category: 'Running Shoes',
    current_price: 835,
    image_url: 'https://media.sportguru.ro/media/catalog/product/4/0/403498_1_1.jpg',
    available_sizes: ['42', '42 2/3', '43 1/3', '44', '44 2/3', '45 1/3', '46', '46 2/3', '47 1/3'],
    stock_status: 'In Stock',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-hoka-clifton-11-wide',
  },
  {
    product_id: 'hoka-bondi-9-w',
    name: 'Pantofi alergare dama Hoka Bondi 9 FW 2026',
    brand: 'Hoka',
    sport: 'Running',
    category: 'Running Shoes',
    current_price: 940,
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1162012-wttr_1_1.jpg',
    stock_status: 'In Stock',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-dama-hoka-bondi-9-fw-2026',
  },
  {
    product_id: 'mizuno-horizon-9-m',
    name: 'Pantofi alergare barbati Mizuno Wave Horizon 9 FW 2026',
    brand: 'Mizuno',
    sport: 'Running',
    category: 'Running Shoes',
    current_price: 906.3,
    original_price: 1007,
    discount_percent: 10,
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_j1gc262652_11_1__1_1.jpg',
    stock_status: 'In Stock',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-mizuno-wave-horizon-9-fw-2026',
  },
  {
    product_id: 'nike-vomero-premium-w',
    name: 'Pantofi alergare dama Nike Vomero Premium SS 2026',
    brand: 'Nike',
    sport: 'Running',
    category: 'Running Shoes',
    current_price: 974,
    original_price: 1217,
    discount_percent: 20,
    image_url: 'https://media.sportguru.ro/media/catalog/product/w/_/w_nike_vomero_premium_2__1_2.jpg',
    stock_status: 'In Stock',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-nike-vomero-premium-ss-2026',
  },
  {
    product_id: 'adidas-evo-sl-m',
    name: 'Pantofi alergare barbati Adidas Adizero Evo SL FW 2026',
    brand: 'Adidas',
    sport: 'Running',
    category: 'Running Shoes',
    current_price: 660,
    original_price: 750,
    discount_percent: 12,
    image_url: 'https://media.sportguru.ro/media/catalog/product/k/i/ki9874_b2b015_pdp_1.jpg',
    stock_status: 'In Stock',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-adidas-adizero-evo-sl-fw-2026',
  },
];

// Brand palette from the action payload — used to derive card info-strip background.
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
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function formatPrice(value) {
  if (value == null || value === '') return '';
  return `${Number(value).toLocaleString('ro-RO')} lei`;
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
    empty.textContent = 'No matching products were found. Try refining the sport, intended use, size, or budget.';
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
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const leftBtn = buildArrow('left', track, fade);
  const rightBtn = buildArrow('right', track, fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftBtn.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    rightBtn.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);
  setTimeout(updateArrows, 300);

  block.appendChild(wrapper);

  const summary = document.createElement('p');
  summary.className = 'ssp-summary';
  summary.textContent = `Showing ${items.length} matching product${items.length === 1 ? '' : 's'}. Refine by sport, intended use, size, or budget to narrow the results.`;
  block.appendChild(summary);
}

function buildArrow(dir, track, fade) {
  const btn = document.createElement('button');
  btn.className = `ssp-arrow ssp-arrow-${dir}`;
  btn.type = 'button';
  btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
  btn.textContent = dir === 'left' ? '◀' : '▶';
  const scroll = () => {
    const card = track.querySelector('.ssp-card');
    const amount = card ? card.offsetWidth + 16 : 236;
    track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };
  btn.addEventListener('click', scroll);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); }
  });
  return btn;
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'ssp-card';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'ssp-img';

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
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }

  if (item.discount_percent) {
    const badge = document.createElement('span');
    badge.className = 'ssp-discount';
    badge.textContent = `-${item.discount_percent}%`;
    imageWrap.appendChild(badge);
  }

  const low = /low|last|limited/i.test(item.stock_status || '');
  const out = /out of stock|unavailable|sold/i.test(item.stock_status || '');
  if (item.stock_status && (low || out)) {
    const stockBadge = document.createElement('span');
    stockBadge.className = `ssp-stock-badge ${out ? 'ssp-stock-out' : 'ssp-stock-low'}`;
    stockBadge.textContent = item.stock_status;
    imageWrap.appendChild(stockBadge);
  }

  card.appendChild(imageWrap);

  const info = document.createElement('div');
  info.className = 'ssp-info';
  info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const brandRow = document.createElement('div');
  brandRow.className = 'ssp-brand';
  const brandText = [item.brand, item.sport].filter(Boolean).join(' · ');
  brandRow.textContent = brandText;
  info.appendChild(brandRow);

  const name = document.createElement('h3');
  name.className = 'ssp-name';
  name.textContent = item.name || '';
  info.appendChild(name);

  const priceRow = document.createElement('div');
  priceRow.className = 'ssp-price-row';
  const price = document.createElement('span');
  price.className = 'ssp-price';
  price.textContent = formatPrice(item.current_price);
  priceRow.appendChild(price);
  if (item.original_price && item.original_price > (item.current_price || 0)) {
    const orig = document.createElement('span');
    orig.className = 'ssp-orig';
    orig.textContent = formatPrice(item.original_price);
    priceRow.appendChild(orig);
  }
  info.appendChild(priceRow);

  const meta = document.createElement('div');
  meta.className = 'ssp-meta';
  const parts = [];
  if (item.category) parts.push(item.category);
  if (Array.isArray(item.available_sizes) && item.available_sizes.length) {
    parts.push(`Sizes: ${item.available_sizes.slice(0, 4).join(', ')}${item.available_sizes.length > 4 ? '…' : ''}`);
  }
  if (item.stock_status && !low && !out) parts.push(item.stock_status);
  meta.textContent = parts.join(' • ');
  info.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'ssp-actions';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'ssp-cta ssp-cta-primary';
  viewBtn.type = 'button';
  viewBtn.textContent = 'View Product';
  viewBtn.style.background = ACCENT;
  if (bridge && item.product_url) {
    viewBtn.addEventListener('click', () => bridge.openLink(item.product_url));
  }
  actions.appendChild(viewBtn);

  const compareBtn = document.createElement('button');
  compareBtn.className = 'ssp-cta ssp-cta-secondary';
  compareBtn.type = 'button';
  compareBtn.textContent = 'Compare';
  if (bridge) {
    compareBtn.addEventListener('click', () => bridge.sendMessage(`Compare ${item.name} with similar running shoes`));
  }
  actions.appendChild(compareBtn);

  info.appendChild(actions);
  card.appendChild(info);

  return card;
}
