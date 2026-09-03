// codegen:layout-pattern=detail-split
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  product_id: '1012C045',
  name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026',
  brand: 'Asics',
  description: "Women's max-support road running shoe from the Gel-Kayano stability line.",
  sport: 'Running',
  category: 'Pantofi alergare',
  current_price: 714.0,
  original_price: 1020.0,
  discount_percent: 30,
  currency: 'Lei',
  image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg',
  product_url: 'https://www.sportguru.ro',
  available_sizes: ['37', '38', '39', '40', '41', '42'],
  stock_status: 'In stock',
  key_features: ['Max-support stability', 'FF BLAST+ ECO cushioning', '4D GUIDANCE SYSTEM', 'Engineered knit upper'],
  technical_specifications: { Drop: '10 mm', Weight: '248 g', Cushioning: 'Max', Surface: 'Road' },
  intended_use: 'Long-distance road running and daily training for neutral-to-overpronating runners',
  compatibility_notes: ['Runs true to size', 'Consider half-size up for orthotics'],
  collection_year: '2026',
};

// Brand colors from DESIGN_TOKENS' color tier — used to derive the card content background.
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

function formatPrice(value, currency) {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'number' ? value.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
  return currency ? `${num} ${currency}` : `${num}`;
}

function buildListSection(labelText, items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const details = document.createElement('details');
  details.className = 'get-product-details-section';
  const summary = document.createElement('summary');
  summary.textContent = labelText;
  details.appendChild(summary);
  const ul = document.createElement('ul');
  items.forEach((it) => {
    const li = document.createElement('li');
    li.textContent = it;
    ul.appendChild(li);
  });
  details.appendChild(ul);
  return details;
}

function buildSpecSection(labelText, specs) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return null;
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;
  const details = document.createElement('details');
  details.className = 'get-product-details-section';
  const summary = document.createElement('summary');
  summary.textContent = labelText;
  details.appendChild(summary);
  const dl = document.createElement('dl');
  dl.className = 'get-product-details-specs';
  entries.forEach(([k, v]) => {
    const row = document.createElement('div');
    row.className = 'get-product-details-spec';
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = typeof v === 'object' ? JSON.stringify(v) : v;
    row.appendChild(dt);
    row.appendChild(dd);
    dl.appendChild(row);
  });
  details.appendChild(dl);
  return details;
}

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'get-product-details-card';

  // Image panel (LEFT)
  const imgPanel = document.createElement('div');
  imgPanel.className = 'get-product-details-image-panel';
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'get-product-details-image-placeholder';
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    imgPanel.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.className = 'get-product-details-image-placeholder';
    imgPanel.appendChild(d);
  }
  if (item.discount_percent) {
    const disc = document.createElement('span');
    disc.className = 'get-product-details-discount';
    disc.textContent = `${item.discount_percent}% OFF`;
    imgPanel.appendChild(disc);
  }
  card.appendChild(imgPanel);

  // Content panel (RIGHT)
  const content = document.createElement('div');
  content.className = 'get-product-details-content';
  content.style.background = theme ? theme.bg : '#6100a2';
  content.style.color = theme ? theme.fg : '#fff';

  if (item.brand) {
    const brand = document.createElement('p');
    brand.className = 'get-product-details-brand';
    brand.textContent = item.sport ? `${item.brand} • ${item.sport}` : item.brand;
    content.appendChild(brand);
  }

  const title = document.createElement('h2');
  title.className = 'get-product-details-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'get-product-details-meta';
  if (item.category) {
    const cat = document.createElement('span');
    cat.className = 'get-product-details-chip';
    cat.textContent = item.category;
    meta.appendChild(cat);
  }
  if (item.stock_status) {
    const stock = document.createElement('span');
    stock.className = 'get-product-details-chip stock';
    stock.textContent = item.stock_status;
    meta.appendChild(stock);
  }
  if (meta.childNodes.length) content.appendChild(meta);

  if (item.current_price !== undefined && item.current_price !== null) {
    const priceRow = document.createElement('div');
    priceRow.className = 'get-product-details-price-row';
    const price = document.createElement('span');
    price.className = 'get-product-details-price';
    price.textContent = formatPrice(item.current_price, item.currency);
    priceRow.appendChild(price);
    if (item.original_price && item.original_price !== item.current_price) {
      const orig = document.createElement('span');
      orig.className = 'get-product-details-original';
      orig.textContent = formatPrice(item.original_price, item.currency);
      priceRow.appendChild(orig);
    }
    content.appendChild(priceRow);
  }

  if (Array.isArray(item.available_sizes) && item.available_sizes.length) {
    const sizes = document.createElement('div');
    sizes.className = 'get-product-details-sizes';
    const label = document.createElement('span');
    label.className = 'get-product-details-sizes-label';
    label.textContent = 'Sizes';
    sizes.appendChild(label);
    item.available_sizes.forEach((s) => {
      const chip = document.createElement('span');
      chip.className = 'get-product-details-size';
      chip.textContent = s;
      sizes.appendChild(chip);
    });
    content.appendChild(sizes);
  }

  // Expandable sections — key_features + technical_specifications (top 2 per content budget)
  const sections = document.createElement('div');
  sections.className = 'get-product-details-sections';
  const features = buildListSection('Key features', item.key_features);
  if (features) sections.appendChild(features);
  const specs = buildSpecSection('Technical specifications', item.technical_specifications);
  if (specs) sections.appendChild(specs);
  if (sections.childNodes.length) content.appendChild(sections);

  if (item.collection_year) {
    const year = document.createElement('p');
    year.className = 'get-product-details-year';
    year.textContent = `Collection ${item.collection_year}`;
    content.appendChild(year);
  }

  // Actions — primary + secondary (top 2 CTAs per content budget)
  const actions = document.createElement('div');
  actions.className = 'get-product-details-actions';

  const primary = document.createElement('button');
  primary.className = 'get-product-details-cta primary';
  primary.textContent = 'Choose Size and Buy';
  if (bridge) {
    primary.addEventListener('click', () => {
      if (item.product_url) bridge.openLink(item.product_url);
      else bridge.sendMessage(`How do I buy ${item.name}?`);
    });
  }
  actions.appendChild(primary);

  const secondary = document.createElement('button');
  secondary.className = 'get-product-details-cta secondary';
  secondary.textContent = 'Compare Product';
  if (bridge) {
    secondary.addEventListener('click', () => {
      bridge.sendMessage(`Compare ${item.name} with similar products`);
    });
  }
  actions.appendChild(secondary);

  content.appendChild(actions);
  card.appendChild(content);
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). Do NOT look for a wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'get-product-details-empty';
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
