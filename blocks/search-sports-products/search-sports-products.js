// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026', description: "Women's max-support road running shoe from the Gel-Kayano stability line.", image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg', price: '714,00 Lei', original_price: '1.020,00 Lei', discount_percentage: '30% OFF', category: 'Pantofi alergare', brand: 'Asics', is_deal: true },
  { name: 'Pantofi alergare dama ON Cloudmonster 3 SS 2026', description: "Women's max-cushioned road running shoe with CloudTec Phase geometry.", image_url: 'https://media.sportguru.ro/media/catalog/product/2/9/298c4e35e342e0c081ad5efe5ddb1eae61c660b9_gm_optimized.jpg', price: '765,00 Lei', original_price: '1.020,00 Lei', discount_percentage: '25% OFF', category: 'Pantofi alergare', brand: 'ON', is_deal: true },
  { name: 'Pantofi alergare barbati Puma Deviate Nitro Elite 4 Showtime SS 2026', description: "Men's carbon-plated racing shoe built for speed sessions and racing.", price: '875,00 Lei', original_price: '1.249,00 Lei', discount_percentage: '30% OFF', category: 'Pantofi alergare', brand: 'Puma', is_deal: true, image_url: 'https://media.sportguru.ro/media/catalog/product/d/e/deviate-nitro_-elite-4-showtime-.jpg?width=265&height=265&store=default&image-type=image' },
  { name: 'Ceas Garmin Fenix 9 AMOLED Titanium - 43 mm', description: 'Premium multisport AMOLED GPS watch with titanium build in a 43 mm case.', image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-04761-01_1_.jpg', price: '5.269,00 Lei', category: 'Ceasuri sport', brand: 'Garmin' },
  { name: 'Pantofi alergare barbati Adidas Supernova Rise 3 SS 2026', description: "Men's daily-training road running shoe with Dreamstrike+ cushioning.", price: '570,00 Lei', original_price: '750,00 Lei', discount_percentage: '24% OFF', category: 'Pantofi alergare', brand: 'Adidas', is_deal: true, image_url: 'https://media.sportguru.ro/media/catalog/product/j/p/jp8689_b2b012_plp.jpg?width=265&height=265&store=default&image-type=image' },
  { name: 'Ceas Garmin Instinct 3 - 45 mm, Solar, Tactical Edition', description: 'Rugged solar-charging GPS watch in a 45 mm tactical edition.', image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-02934-501.jpg', price: '2.049,00 Lei', original_price: '2.279,00 Lei', discount_percentage: '10% OFF', category: 'Ceasuri sport', brand: 'Garmin', is_deal: true },
  { name: 'Ghete fotbal Mizuno Alpha III Elite Mix SS 2026', description: 'Elite firm-ground/mixed-surface football boots from the Alpha III line.', image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_p1gc266264_11.png', price: '704,00 Lei', original_price: '1.173,00 Lei', discount_percentage: '40% OFF', category: 'Ghete fotbal', brand: 'Mizuno', is_deal: true },
  { name: 'Bluza ciclism barbati Oakley Icon Training SS 2026', description: "Men's short-sleeve cycling training jersey from Oakley.", price: '536,00 Lei', original_price: '765,00 Lei', discount_percentage: '30% OFF', category: 'Imbracaminte ciclism', brand: 'Oakley', is_deal: true, image_url: 'https://media.sportguru.ro/media/catalog/product/f/o/foa407938-021-oakley-parent_1.jpg' },
];

// Brand colors from SportGuru design tokens (violet accent, lime CTA, black).
const PALETTE = ['#6100a2', '#3de525', '#000000'];
const CARD_COLORS = ['#6100a2', '#3de525', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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

function priceOf(item) { return item.current_price != null ? item.current_price : item.price; }
function origOf(item) { return item.original_price != null ? item.original_price : null; }
function subtitleOf(item) {
  return [item.brand, item.sport || item.category].filter(Boolean).join(' · ');
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
  const wrapper = document.createElement('div');
  wrapper.className = 'search-sports-products-wrapper';

  const track = document.createElement('div');
  track.className = 'search-sports-products-track';

  items.slice(0, 8).forEach((item, i) => {
    track.appendChild(buildCard(item, i, bridge));
  });

  const leftBtn = document.createElement('button');
  leftBtn.className = 'search-sports-products-nav search-sports-products-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'search-sports-products-nav search-sports-products-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const scrollByCard = (dir) => { track.scrollBy({ left: dir * 236, behavior: 'smooth' }); };
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollByCard(idx === 0 ? -1 : 1); }
    });
  });

  const fade = document.createElement('div');
  fade.className = 'search-sports-products-fade';
  fade.style.background = `linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc)`;

  const updateNav = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.opacity = atEnd ? '0' : '1';
  };
  track.addEventListener('scroll', updateNav);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);
  requestAnimationFrame(updateNav);
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'search-sports-products-card';

  const imageBox = document.createElement('div');
  imageBox.className = 'search-sports-products-image';

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

  const disc = item.discount_percentage;
  const hasDeal = item.is_deal === true || !!disc || origOf(item) != null;
  if (disc) {
    const badge = document.createElement('span');
    badge.className = 'search-sports-products-discount';
    badge.textContent = disc;
    imageBox.appendChild(badge);
  }

  const stock = item.stock_status;
  const inStock = stock ? /in.?stock|disponibil|available/i.test(stock) : true;
  if (stock) {
    const st = document.createElement('span');
    st.className = `search-sports-products-stock ${inStock ? 'in' : 'out'}`;
    st.textContent = stock;
    imageBox.appendChild(st);
  }

  card.appendChild(imageBox);

  const info = document.createElement('div');
  info.className = 'search-sports-products-info';
  info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  if (hasDeal) card.classList.add('is-deal');

  const name = document.createElement('h3');
  name.className = 'search-sports-products-name';
  name.textContent = item.name || '';
  info.appendChild(name);

  const sub = subtitleOf(item);
  if (sub) {
    const subEl = document.createElement('p');
    subEl.className = 'search-sports-products-sub';
    subEl.textContent = sub;
    info.appendChild(subEl);
  }

  const priceRow = document.createElement('div');
  priceRow.className = 'search-sports-products-pricerow';
  const price = priceOf(item);
  if (price != null) {
    const cur = document.createElement('span');
    cur.className = 'search-sports-products-price';
    cur.textContent = typeof price === 'number' ? `${price} Lei` : price;
    priceRow.appendChild(cur);
  }
  const orig = origOf(item);
  if (orig != null) {
    const was = document.createElement('span');
    was.className = 'search-sports-products-orig';
    was.textContent = typeof orig === 'number' ? `${orig} Lei` : orig;
    priceRow.appendChild(was);
  }
  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'search-sports-products-cat';
    badge.textContent = item.category;
    priceRow.appendChild(badge);
  }
  info.appendChild(priceRow);

  if (Array.isArray(item.available_sizes) && item.available_sizes.length) {
    const sizes = document.createElement('p');
    sizes.className = 'search-sports-products-sizes';
    sizes.textContent = `Sizes: ${item.available_sizes.join(', ')}`;
    info.appendChild(sizes);
  }

  if (item.match_reason) {
    const reason = document.createElement('p');
    reason.className = 'search-sports-products-reason';
    reason.textContent = item.match_reason;
    info.appendChild(reason);
  }

  const cta = document.createElement('button');
  cta.className = 'search-sports-products-cta';
  cta.textContent = 'View Product';
  if (bridge) {
    cta.addEventListener('click', () => {
      if (item.product_url) bridge.openLink(item.product_url);
      else bridge.sendMessage(`Tell me more about ${item.name}`);
    });
  }
  info.appendChild(cta);

  const secondary = document.createElement('div');
  secondary.className = 'search-sports-products-secondary';
  const compareBtn = document.createElement('button');
  compareBtn.className = 'search-sports-products-link';
  compareBtn.textContent = 'Compare';
  const refineBtn = document.createElement('button');
  refineBtn.className = 'search-sports-products-link';
  refineBtn.textContent = 'Refine Results';
  if (bridge) {
    compareBtn.addEventListener('click', () => bridge.sendMessage(`Compare ${item.name} with similar products`));
    refineBtn.addEventListener('click', () => bridge.sendMessage('Refine these results by terrain, experience level, or technical preferences'));
  }
  secondary.appendChild(compareBtn);
  secondary.appendChild(refineBtn);
  info.appendChild(secondary);

  card.appendChild(info);
  return card;
}
