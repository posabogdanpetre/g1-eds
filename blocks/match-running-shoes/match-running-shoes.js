// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode. In production, data comes from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026',
    description: "Women's max-support road running shoe from the Gel-Kayano stability line.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg',
    price: '714,00 Lei',
    original_price: '1.020,00 Lei',
    discount_percentage: '30% OFF',
    category: 'Pantofi alergare',
    brand: 'Asics',
    is_deal: true,
  },
  {
    name: 'Pantofi alergare dama ON Cloudmonster 3 SS 2026',
    description: "Women's max-cushioned road running shoe with CloudTec Phase geometry.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/2/9/298c4e35e342e0c081ad5efe5ddb1eae61c660b9_gm_optimized.jpg',
    price: '765,00 Lei',
    original_price: '1.020,00 Lei',
    discount_percentage: '25% OFF',
    category: 'Pantofi alergare',
    brand: 'ON',
    is_deal: true,
  },
  {
    name: 'Pantofi alergare barbati Puma Deviate Nitro Elite 4 Showtime SS 2026',
    description: "Men's carbon-plated racing shoe built for speed sessions and racing.",
    price: '875,00 Lei',
    original_price: '1.249,00 Lei',
    discount_percentage: '30% OFF',
    category: 'Pantofi alergare',
    brand: 'Puma',
    is_deal: true,
    image_url: 'https://media.sportguru.ro/media/catalog/product/d/e/deviate-nitro_-elite-4-showtime-.jpg?width=265&height=265&store=default&image-type=image',
  },
  {
    name: 'Ceas Garmin Fenix 9 AMOLED Titanium - 43 mm',
    description: 'Premium multisport AMOLED GPS watch with titanium build in a 43 mm case.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-04761-01_1_.jpg',
    price: '5.269,00 Lei',
    category: 'Ceasuri sport',
    brand: 'Garmin',
  },
  {
    name: 'Pantofi alergare barbati Adidas Supernova Rise 3 SS 2026',
    description: "Men's daily-training road running shoe with Dreamstrike+ cushioning.",
    price: '570,00 Lei',
    original_price: '750,00 Lei',
    discount_percentage: '24% OFF',
    category: 'Pantofi alergare',
    brand: 'Adidas',
    is_deal: true,
    image_url: 'https://media.sportguru.ro/media/catalog/product/j/p/jp8689_b2b012_plp.jpg?width=265&height=265&store=default&image-type=image',
  },
  {
    name: 'Ceas Garmin Instinct 3 - 45 mm, Solar, Tactical Edition',
    description: 'Rugged solar-charging GPS watch in a 45 mm tactical edition.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-02934-501.jpg',
    price: '2.049,00 Lei',
    original_price: '2.279,00 Lei',
    discount_percentage: '10% OFF',
    category: 'Ceasuri sport',
    brand: 'Garmin',
    is_deal: true,
  },
  {
    name: 'Ghete fotbal Mizuno Alpha III Elite Mix SS 2026',
    description: 'Elite firm-ground/mixed-surface football boots from the Alpha III line.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_p1gc266264_11.png',
    price: '704,00 Lei',
    original_price: '1.173,00 Lei',
    discount_percentage: '40% OFF',
    category: 'Ghete fotbal',
    brand: 'Mizuno',
    is_deal: true,
  },
  {
    name: 'Bluza ciclism barbati Oakley Icon Training SS 2026',
    description: "Men's short-sleeve cycling training jersey from Oakley.",
    price: '536,00 Lei',
    original_price: '765,00 Lei',
    discount_percentage: '30% OFF',
    category: 'Imbracaminte ciclism',
    brand: 'Oakley',
    is_deal: true,
    image_url: 'https://media.sportguru.ro/media/catalog/product/f/o/foa407938-021-oakley-parent_1.jpg',
  },
];

const CONCEPT = 'product-list';

// Brand colors from DESIGN_TOKENS. getThemedCardBg darkens PALETTE[0] to luminance <= 0.12
// so white text meets WCAG AA on the card info strip.
const PALETTE = ['#6100a2', '#3de525', '#000000'];

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
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function priceText(item) {
  if (item.current_price != null) {
    const cur = item.currency || 'Lei';
    return `${item.current_price} ${cur}`.trim();
  }
  return item.price || '';
}

function buildBadges(item) {
  const out = [];
  if (item.surface) out.push({ text: item.surface, accent: true });
  if (item.support_type) out.push({ text: item.support_type, accent: false });
  if (item.cushioning_level) out.push({ text: item.cushioning_level, accent: false });
  if (item.intended_distance) out.push({ text: item.intended_distance, accent: false });
  if (!out.length && item.category) out.push({ text: item.category, accent: false });
  return out.slice(0, 4);
}

function renderCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'match-running-shoes-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'match-running-shoes-img';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[i % CARD_COLORS.length]};`;
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
  if (item.brand) {
    const brandTag = document.createElement('span');
    brandTag.className = 'match-running-shoes-brand-tag';
    brandTag.textContent = item.brand;
    imgWrap.appendChild(brandTag);
  }
  card.appendChild(imgWrap);

  const info = document.createElement('div');
  info.className = 'match-running-shoes-info';
  info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const name = document.createElement('div');
  name.className = 'match-running-shoes-name';
  name.textContent = item.name || '';
  info.appendChild(name);

  const badges = buildBadges(item);
  if (badges.length) {
    const badgeRow = document.createElement('div');
    badgeRow.className = 'match-running-shoes-badges';
    badges.forEach((b) => {
      const chip = document.createElement('span');
      chip.className = 'match-running-shoes-badge' + (b.accent ? ' match-running-shoes-badge-accent' : '');
      chip.textContent = b.text;
      badgeRow.appendChild(chip);
    });
    info.appendChild(badgeRow);
  }

  const pt = priceText(item);
  if (pt || item.stock_status) {
    const priceRow = document.createElement('div');
    priceRow.className = 'match-running-shoes-price-row';
    if (pt) {
      const price = document.createElement('span');
      price.className = 'match-running-shoes-price';
      price.textContent = pt;
      priceRow.appendChild(price);
    }
    if (item.original_price) {
      const orig = document.createElement('span');
      orig.className = 'match-running-shoes-orig';
      orig.textContent = item.original_price;
      priceRow.appendChild(orig);
    }
    if (item.stock_status) {
      const stock = document.createElement('span');
      stock.className = 'match-running-shoes-stock';
      stock.textContent = item.stock_status;
      priceRow.appendChild(stock);
    }
    info.appendChild(priceRow);
  }

  if (Array.isArray(item.available_sizes) && item.available_sizes.length) {
    const sizes = document.createElement('div');
    sizes.className = 'match-running-shoes-sizes';
    sizes.textContent = `Sizes: ${item.available_sizes.join(', ')}`;
    info.appendChild(sizes);
  }

  if (item.match_reason) {
    const why = document.createElement('div');
    why.className = 'match-running-shoes-why';
    const label = document.createElement('span');
    label.className = 'match-running-shoes-why-label';
    label.textContent = 'Why it matches';
    why.appendChild(label);
    why.appendChild(document.createTextNode(item.match_reason));
    info.appendChild(why);
  } else if (item.description) {
    const desc = document.createElement('div');
    desc.className = 'match-running-shoes-why';
    desc.textContent = item.description;
    info.appendChild(desc);
  }

  if (item.fit_caution) {
    const fit = document.createElement('div');
    fit.className = 'match-running-shoes-fit';
    fit.textContent = item.fit_caution;
    info.appendChild(fit);
  }

  const cta = document.createElement('button');
  cta.className = 'match-running-shoes-cta';
  cta.textContent = 'View Shoe';
  cta.style.cssText = 'background:#3de525;color:#6100a2;';
  if (bridge) {
    cta.addEventListener('click', () => {
      if (item.product_url) bridge.openLink(item.product_url);
      else bridge.sendMessage(`Tell me more about ${item.name || 'this shoe'}`);
    });
  }
  info.appendChild(cta);

  card.appendChild(info);
  return card;
}

function renderItems(block, items, bridge) {
  block.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'match-running-shoes-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'match-running-shoes-arrow match-running-shoes-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'match-running-shoes-track-wrap';

  const track = document.createElement('div');
  track.className = 'match-running-shoes-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'match-running-shoes-arrow match-running-shoes-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'match-running-shoes-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;

  items.slice(0, 6).forEach((item, i) => {
    track.appendChild(renderCard(item, i, bridge));
  });

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);
  block.appendChild(wrapper);

  const cardWidth = 240 + 16;
  const scroll = (dir) => track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  btnLeft.addEventListener('click', () => scroll(-1));
  btnRight.addEventListener('click', () => scroll(1));
  [btnLeft, btnRight].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(idx === 0 ? -1 : 1); }
    });
  });
  const updateArrows = () => {
    btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    btnRight.style.display = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  updateArrows();
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
      // structuredContent.shoes — derived from action name "match_running_shoes" (bare array outputSchema rule)
      items = structuredContent?.shoes || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;
  // AMCP-360 is_deal partition (keyed on concept): deals-list keeps only deal items,
  // every other list concept excludes them. Applied once to the resolved items.
  items = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));

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
