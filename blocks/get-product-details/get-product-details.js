// Sample data for standalone/preview mode.
// In production, the item comes dynamically from bridge.toolResult (flat structuredContent).
const SAMPLE_ITEM = {
  product_id: '391149',
  name: 'Pantofi alergare barbati Hoka Clifton 11 Wide',
  brand: 'Hoka',
  sport: 'Running',
  category: 'Running Shoes',
  current_price: 835,
  image_url: 'https://media.sportguru.ro/media/catalog/product/4/0/403498_1_1.jpg',
  available_sizes: ['42', '42 2/3', '43 1/3', '44', '44 2/3', '45 1/3', '46', '46 2/3', '47 1/3'],
  stock_status: 'In Stock',
  terrain: 'road',
  cushioning: 'Max cushioning (soft compression-molded EVA)',
  intended_distance: 'Daily training / long runs',
  audience: 'men',
  product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-hoka-clifton-11-wide',
};

// Brand palette from the action payload — used to derive the content-panel background.
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

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function formatPrice(value) {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return String(value);
  return `${num.toLocaleString('ro-RO')} lei`;
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_ITEM;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_ITEM;
  }

  block.textContent = '';

  if (!item || !item.name) {
    const empty = document.createElement('p');
    empty.className = 'gpd-empty';
    empty.textContent = 'No matching product was found.';
    block.appendChild(empty);
  } else {
    renderDetail(block, item, bridge);
  }

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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'gpd-card';

  // ---- Image (LEFT) ----
  const imageCol = document.createElement('div');
  imageCol.className = 'gpd-image';

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
    imageCol.appendChild(img);
  } else {
    imageCol.appendChild(colorDiv());
  }

  const hasDiscount = typeof item.discount_percent === 'number' && item.discount_percent > 0;
  if (hasDiscount) {
    const badge = document.createElement('span');
    badge.className = 'gpd-discount';
    badge.textContent = `-${item.discount_percent}%`;
    imageCol.appendChild(badge);
  }

  card.appendChild(imageCol);

  // ---- Content (RIGHT) ----
  const content = document.createElement('div');
  content.className = 'gpd-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const scroll = document.createElement('div');
  scroll.className = 'gpd-scroll';

  if (item.brand) {
    const brand = document.createElement('span');
    brand.className = 'gpd-brand';
    brand.textContent = item.brand;
    scroll.appendChild(brand);
  }

  const title = document.createElement('h3');
  title.className = 'gpd-title';
  title.textContent = item.name;
  scroll.appendChild(title);

  // Meta chips (category / sport / stock)
  const chips = document.createElement('div');
  chips.className = 'gpd-chips';
  [item.category, item.sport].forEach((val) => {
    if (val) {
      const chip = document.createElement('span');
      chip.className = 'gpd-chip';
      chip.textContent = val;
      chips.appendChild(chip);
    }
  });
  if (item.stock_status) {
    const stock = document.createElement('span');
    stock.className = 'gpd-chip gpd-stock';
    stock.textContent = item.stock_status;
    chips.appendChild(stock);
  }
  if (chips.childNodes.length) scroll.appendChild(chips);

  // Price row
  const priceRow = document.createElement('div');
  priceRow.className = 'gpd-price-row';
  const price = document.createElement('span');
  price.className = 'gpd-price';
  price.textContent = formatPrice(item.current_price);
  priceRow.appendChild(price);
  if (typeof item.original_price === 'number' && item.original_price > (item.current_price || 0)) {
    const orig = document.createElement('span');
    orig.className = 'gpd-orig-price';
    orig.textContent = formatPrice(item.original_price);
    priceRow.appendChild(orig);
  }
  if (item.current_price !== undefined) scroll.appendChild(priceRow);

  // Description / narrative
  const descText = item.description
    || buildNarrative(item);
  if (descText) {
    const desc = document.createElement('p');
    desc.className = 'gpd-desc';
    desc.textContent = descText;
    scroll.appendChild(desc);
  }

  // Sizes / variants
  const variants = item.available_variants || item.available_sizes;
  if (Array.isArray(variants) && variants.length) {
    const sizesLabel = document.createElement('div');
    sizesLabel.className = 'gpd-section-label';
    sizesLabel.textContent = 'Available sizes';
    scroll.appendChild(sizesLabel);

    const sizeWrap = document.createElement('div');
    sizeWrap.className = 'gpd-sizes';
    variants.forEach((v) => {
      const s = document.createElement('span');
      s.className = 'gpd-size';
      s.textContent = v;
      sizeWrap.appendChild(s);
    });
    scroll.appendChild(sizeWrap);
  }

  // Specifications
  const specs = buildSpecs(item);
  if (specs.length) {
    const specLabel = document.createElement('div');
    specLabel.className = 'gpd-section-label';
    specLabel.textContent = 'Specifications';
    scroll.appendChild(specLabel);

    const specList = document.createElement('dl');
    specList.className = 'gpd-specs';
    specs.forEach(([k, v]) => {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      specList.appendChild(dt);
      specList.appendChild(dd);
    });
    scroll.appendChild(specList);
  }

  // Delivery
  if (item.delivery_summary) {
    const delivery = document.createElement('p');
    delivery.className = 'gpd-delivery';
    delivery.textContent = item.delivery_summary;
    scroll.appendChild(delivery);
  }

  // Service options
  if (Array.isArray(item.service_options) && item.service_options.length) {
    const svc = document.createElement('p');
    svc.className = 'gpd-services';
    svc.textContent = `Services: ${item.service_options.join(', ')}`;
    scroll.appendChild(svc);
  }

  content.appendChild(scroll);

  // CTA — open the product page to continue toward purchase
  if (item.product_url) {
    const cta = document.createElement('button');
    cta.className = 'gpd-cta';
    cta.type = 'button';
    cta.textContent = 'View on SportGuru';
    if (bridge) {
      cta.addEventListener('click', () => bridge.openLink(item.product_url));
    }
    content.appendChild(cta);
  }

  card.appendChild(content);
  block.appendChild(card);
}

function buildNarrative(item) {
  const parts = [];
  if (item.intended_distance) parts.push(item.intended_distance);
  else if (item.intended_use) parts.push(item.intended_use);
  if (item.cushioning) parts.push(`${item.cushioning} cushioning`);
  if (item.terrain) parts.push(`built for ${item.terrain}`);
  if (!parts.length) return '';
  return `Ideal for ${parts.join(', ')}.`;
}

function buildSpecs(item) {
  const rows = [];
  if (item.terrain) rows.push(['Terrain', item.terrain]);
  if (item.cushioning) rows.push(['Cushioning', item.cushioning]);
  if (item.intended_distance) rows.push(['Best for', item.intended_distance]);
  if (item.intended_use) rows.push(['Intended use', item.intended_use]);
  if (item.audience) rows.push(['Audience', item.audience]);
  if (item.specifications && typeof item.specifications === 'object') {
    Object.entries(item.specifications).forEach(([k, v]) => {
      rows.push([k, typeof v === 'object' ? JSON.stringify(v) : String(v)]);
    });
  }
  return rows;
}
