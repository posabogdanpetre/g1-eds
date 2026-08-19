// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { product_id: 'nike-vomero-premium-w', name: 'Pantofi alergare dama Nike Vomero Premium SS 2026', brand: 'Nike', sport: 'Running', category: 'Running Shoes', current_price: 974, original_price: 1217, discount_percent: 20, image_url: 'https://media.sportguru.ro/media/catalog/product/w/_/w_nike_vomero_premium_2__1_2.jpg', available_sizes: [], stock_status: 'In Stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-nike-vomero-premium-ss-2026' },
  { product_id: 'lasportiva-bushido-iii-m', name: 'Pantofi alergare trail barbati La Sportiva Bushido III', brand: 'La Sportiva', sport: 'Trail Running', category: 'Running Shoes', current_price: 612.5, original_price: 875, discount_percent: 30, image_url: 'https://media.sportguru.ro/media/catalog/product/n/t/ntyrnt_1_1_2.jpg', available_sizes: [], stock_status: 'In Stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-trail-teren-accidentat/pantofi-alergare-trail-barbati-la-sportiva-bushido-iii' },
  { product_id: 'mizuno-horizon-9-m', name: 'Pantofi alergare barbati Mizuno Wave Horizon 9 FW 2026', brand: 'Mizuno', sport: 'Running', category: 'Running Shoes', current_price: 906.3, original_price: 1007, discount_percent: 10, image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_j1gc262652_11_1__1_1.jpg', available_sizes: [], stock_status: 'In Stock', product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-mizuno-wave-horizon-9-fw-2026' },
  { product_id: 'adidas-evo-sl-m', name: 'Pantofi alergare barbati Adidas Adizero Evo SL FW 2026', brand: 'Adidas', sport: 'Running', category: 'Running Shoes', current_price: 660, original_price: 750, discount_percent: 12, image_url: 'https://media.sportguru.ro/media/catalog/product/k/i/ki9874_b2b015_pdp_1.jpg', available_sizes: [], stock_status: 'In Stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-adidas-adizero-evo-sl-fw-2026' },
  { product_id: 'garmin-quatix-8-pro', name: 'Ceas Garmin Quatix 8 Pro AMOLED - 47 mm', brand: 'Garmin', sport: 'Multisport', category: 'Sport Watches / GPS', current_price: 5885.1, original_price: 6539, discount_percent: 10, image_url: 'https://media.sportguru.ro/media/catalog/product/c/1/c18cd661-b6b1-4283-9792-5512d4e8b8b7_1_1.jpg', available_sizes: [], stock_status: 'In Stock', product_url: 'https://www.sportguru.ro/ceas-garmin-quatix-8-pro-amoled-47-mm' },
];

// Brand palette from the action payload — getThemedCardBg darkens palette[0] to
// luminance <= 0.12 so white text meets WCAG AA contrast.
const PALETTE = ['#6100A2', '#141414', '#CC0000', '#FFFFFF', '#57575A'];

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
const ACCENT = PALETTE[0] || '#6100A2';

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function fmtPrice(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;
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
      // structuredContent.deals — bare array outputSchema; key derived from actionName "find_current_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items || [], bridge);

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
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'fcd-empty';
    empty.textContent = 'No current deals match your filters right now.';
    block.appendChild(empty);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'fcd-wrapper';

  const track = document.createElement('div');
  track.className = 'fcd-track';

  items.forEach((item, i) => {
    track.appendChild(buildCard(item, i, bridge));
  });
  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'fcd-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'fcd-nav fcd-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  const rightBtn = document.createElement('button');
  rightBtn.className = 'fcd-nav fcd-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const cardStep = 236;
  const updateNav = () => {
    leftBtn.style.display = track.scrollLeft > 4 ? 'flex' : 'none';
    rightBtn.style.display = track.scrollLeft + track.clientWidth < track.scrollWidth - 4 ? 'flex' : 'none';
  };
  const scrollBy = (dir) => { track.scrollBy({ left: dir * cardStep, behavior: 'smooth' }); };
  leftBtn.addEventListener('click', () => scrollBy(-1));
  rightBtn.addEventListener('click', () => scrollBy(1));
  [leftBtn, rightBtn].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(idx === 0 ? -1 : 1); }
    });
  });
  track.addEventListener('scroll', updateNav);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  block.appendChild(wrapper);

  // Savings summary beneath the grid
  const best = items.reduce((acc, it) => {
    const d = Number(it.discount_percent) || 0;
    return d > (acc?.discount_percent || 0) ? it : acc;
  }, null);
  const summary = document.createElement('p');
  summary.className = 'fcd-summary';
  if (best && Number(best.discount_percent) > 0) {
    summary.textContent = `Best deal: ${best.name} at ${best.discount_percent}% off (${fmtPrice(best.current_price)}). Stock and promotional pricing can change.`;
  } else {
    summary.textContent = 'Prices reflect current catalog offers. Stock and promotional pricing can change.';
  }
  block.appendChild(summary);

  requestAnimationFrame(updateNav);
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'fcd-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'fcd-img';

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
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(colorDiv());
  }

  const disc = Number(item.discount_percent);
  if (disc > 0) {
    const badge = document.createElement('span');
    badge.className = 'fcd-badge';
    badge.textContent = `-${disc}%`;
    imgWrap.appendChild(badge);
  }
  card.appendChild(imgWrap);

  const info = document.createElement('div');
  info.className = 'fcd-info';
  info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h3');
  name.className = 'fcd-name';
  name.textContent = item.name || '';
  info.appendChild(name);

  const meta = document.createElement('p');
  meta.className = 'fcd-meta';
  meta.textContent = [item.brand, item.category].filter(Boolean).join(' · ');
  info.appendChild(meta);

  const priceRow = document.createElement('div');
  priceRow.className = 'fcd-price-row';
  if (item.original_price && Number(item.original_price) > Number(item.current_price)) {
    const orig = document.createElement('span');
    orig.className = 'fcd-orig';
    orig.textContent = fmtPrice(item.original_price);
    priceRow.appendChild(orig);
  }
  const cur = document.createElement('span');
  cur.className = 'fcd-cur';
  cur.textContent = fmtPrice(item.current_price);
  priceRow.appendChild(cur);
  info.appendChild(priceRow);

  if (item.stock_status) {
    const stock = document.createElement('span');
    stock.className = 'fcd-stock';
    stock.textContent = item.stock_status;
    info.appendChild(stock);
  }

  const cta = document.createElement('button');
  cta.className = 'fcd-cta';
  cta.textContent = 'View Deal';
  if (bridge && item.product_url) {
    cta.addEventListener('click', () => bridge.openLink(item.product_url));
  } else if (bridge) {
    cta.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
  }
  info.appendChild(cta);

  card.appendChild(info);
  return card;
}
