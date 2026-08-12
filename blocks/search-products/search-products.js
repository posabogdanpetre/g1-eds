// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Bicicleta electrica MTB Amflow PX Carbon Pro 29''/27.5'' 2026",
    description: 'Carbon-frame electric mountain bike for 2026.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/b/i/bicicleta-electrica-amflow-px-carbon-pro-moonstone-gray-m_372857_1_1775876618.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 50.990,01 Lei',
    category: 'Biciclete',
  },
  {
    name: 'Ceas Garmin Forerunner 170 Music',
    description: 'GPS running smartwatch with music storage.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-03920-10_2_.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 1.789,00 Lei',
    category: 'Ceasuri sport',
  },
  {
    name: 'Pantofi alergare dama Hoka Skyward X 2',
    description: "Women's road running shoes.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171926-lrmt_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.205,00 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Bicicleta pliabila Dahon Boardwalk D7-16"',
    description: '7-speed folding bicycle.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/h/a/hac671_2__2.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 3.698,99 Lei',
    category: 'Biciclete',
  },
  {
    name: 'Pantofi alergare trail dama Hoka Zinal 3',
    description: "Women's trail running shoes for rough terrain.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171953-snkn_1_1_.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '835,00 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Casti audio Shokz OpenDots One',
    description: 'Open-ear sport headphones.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/o/p/opendos-one-black.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.055,00 Lei',
    category: 'Casti audio',
  },
  {
    name: 'Casca ciclism Oakley Velo Stelvio MIPS',
    description: 'Cycling helmet with MIPS protection.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/7/b/7b0e5947-c959-4ffc-8962-49806445ac7b.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.683,00 Lei',
    category: 'Casti bicicleta',
  },
  {
    name: 'Pantofi alergare barbati Adidas Adizero Adios Pro 4 FW 2026',
    description: "Men's carbon-plated road racing shoes.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/a/d/adidas-adizero-adios-pro-4-herren-kj0803-weiss_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.250,00 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Ceas Garmin Instinct 3 - 45 mm, Solar, Tactical Edition',
    description: 'Rugged solar GPS smartwatch, tactical edition.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-02934-501.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '2.279,00 Lei',
    category: 'Ceasuri sport',
  },
];

// Brand palette from the action payload — used to derive card info-strip background.
const PALETTE = ['#6100a2'];

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
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
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
  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  (items || []).slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-products-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'search-products-image';
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
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'search-products-meta';

    const price = document.createElement('span');
    price.className = 'search-products-price';
    price.textContent = item.price || '';
    meta.appendChild(price);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.textContent = item.category;
      badge.style.cssText = `background:${ACCENT};`;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const btn = document.createElement('button');
    btn.className = 'search-products-cta';
    btn.type = 'button';
    btn.textContent = 'Vezi detalii';
    btn.style.cssText = `background:${ACCENT};`;
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `search-products-arrow search-products-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    const scrollBy = () => {
      const card = track.querySelector('.search-products-card');
      const amount = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    b.addEventListener('click', scrollBy);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  setTimeout(updateArrows, 0);

  block.appendChild(wrapper);
}
