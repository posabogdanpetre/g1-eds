// codegen:layout-pattern=deals-carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
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

const CONCEPT = 'deals-list';

// Brand colors from DESIGN_TOKENS (Velocity Signal): violet accent, lime CTA, black.
const PALETTE = ['#6100a2', '#3de525', '#000000'];
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
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

function pick(item, keys) {
  for (const k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== '') return item[k];
  }
  return undefined;
}

function formatPercent(item) {
  const raw = pick(item, ['discount_percentage', 'discount_percent']);
  if (raw === undefined) return undefined;
  if (typeof raw === 'number') return `${raw}% OFF`;
  const str = String(raw);
  return /off/i.test(str) ? str : `${str}% OFF`;
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
    items = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));
    block.textContent = '';
    renderDeals(block, items, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    items = SAMPLE_DATA.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));
    block.textContent = '';
    renderDeals(block, items, bridge);
  }
}

function renderDeals(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'deals-wrapper';

  const track = document.createElement('div');
  track.className = 'deals-track';

  items.slice(0, 8).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'deal-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'deal-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    const imageUrl = pick(item, ['image_url', 'image']);
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }

    const pct = formatPercent(item);
    if (pct) {
      const badge = document.createElement('div');
      badge.className = 'deal-badge';
      badge.textContent = pct;
      imageBox.appendChild(badge);
    }

    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'deal-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const brand = pick(item, ['brand']);
    if (brand) {
      const b = document.createElement('div');
      b.className = 'deal-brand';
      b.textContent = brand;
      info.appendChild(b);
    }

    const title = document.createElement('div');
    title.className = 'deal-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    const priceRow = document.createElement('div');
    priceRow.className = 'deal-price-row';
    const orig = pick(item, ['original_price']);
    if (orig) {
      const o = document.createElement('span');
      o.className = 'deal-orig';
      o.textContent = orig;
      priceRow.appendChild(o);
    }
    const cur = pick(item, ['price', 'current_price']);
    if (cur !== undefined) {
      const c = document.createElement('span');
      c.className = 'deal-cur';
      c.textContent = typeof cur === 'number' ? `${cur} Lei` : cur;
      priceRow.appendChild(c);
    }
    info.appendChild(priceRow);

    const cta = document.createElement('button');
    cta.className = 'deal-cta';
    cta.type = 'button';
    cta.textContent = 'View Deal';
    if (bridge) {
      cta.addEventListener('click', () => {
        const url = pick(item, ['product_url', 'url']);
        if (url) bridge.openLink(url);
        else bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'deals-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `deals-arrow deals-arrow-${dir}`;
    btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    btn.textContent = dir === 'left' ? '◀' : '▶';
    btn.addEventListener('click', () => {
      const card = track.querySelector('.deal-card');
      const step = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
    });
    return btn;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftArrow.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
