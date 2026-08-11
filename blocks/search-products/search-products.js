// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Pantofi alergare dama Nike Vomero Premium SS 2026',
    description: "Women's premium road running shoe.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/w/_/w_nike_vomero_premium_2__1_2.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 974,00 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Pantofi alergare trail barbati Nike ACG Zegama SS 2026',
    description: "Men's trail running shoe for rough terrain.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/h/v/hv8113-600_4__1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 720,00 Lei',
    category: 'Pantofi alergare trail',
  },
  {
    name: 'Pantofi alergare barbati Mizuno Wave Skyrise 7 FW 2026',
    description: "Men's cushioned road running shoe.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_j1gc260905_11_1__1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 715,50 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Pantofi alergare Mizuno Hyperwarp Pro FW 2026',
    description: 'Performance road running shoe.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_j1gc267281_11_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 1.192,50 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Pantofi alergare dama Hoka Clifton 11',
    description: "Women's lightweight cushioned running shoe.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1176573-tww_1_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 835,00 Lei',
    category: 'Pantofi alergare',
  },
  {
    name: 'Pantofi trekking dama Salomon X ULTRA 5 SS 2026',
    description: "Women's hiking and trekking shoe.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/l/4/l49099200_0_gho_x_ultra_5_w_desert_tan_iron_green_milieu_2.png?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 519,40 Lei',
    category: 'Incaltaminte outdoor',
  },
  {
    name: 'Ghete trekking barbati Hoka Transport Hike GTX SS 2026',
    description: "Men's waterproof GTX trekking boot.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1172912-bblc_1_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 792,00 Lei',
    category: 'Incaltaminte outdoor',
  },
  {
    name: 'Pantofi trekking barbati Hoka Anacapa 2 Low GTX',
    description: "Men's waterproof low-cut trekking shoe.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1141632-wmn_1_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'De la 668,00 Lei',
    category: 'Incaltaminte outdoor',
  },
];

// Brand palette from the action payload.
const PALETTE = ['#6100a2', '#3de525'];

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
  wrapper.className = 'search-products-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  items.slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-products-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'search-products-image';

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
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'search-products-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

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
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const btn = document.createElement('button');
    btn.className = 'search-products-cta';
    btn.type = 'button';
    btn.textContent = 'Vezi detalii';
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
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `search-products-arrow search-products-arrow-${dir}`;
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.addEventListener('click', () => {
      const amount = 236 * (dir === 'left' ? -1 : 1);
      track.scrollBy({ left: amount, behavior: 'smooth' });
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
