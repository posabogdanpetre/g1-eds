// codegen:layout-pattern=detail-split
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'ASUS Zenbook A16 (UX3607)',
  description: 'Ultra-lightweight 16-inch 3K OLED Copilot+ laptop with Snapdragon X2 Elite Extreme and 21+ hours of battery life.',
  image_url: 'https://dlcdnwebimgs.asus.com/gain/c5590f5d-0618-41e1-8f79-d8746a3e7301/',
  price: '$1,799.99',
  category: 'Laptop',
  series: 'Zenbook',
  availability: 'In stock',
};

// Brand colors from DESIGN_TOKENS' color tier — used to derive the card info-strip background.
const PALETTE = ['#006ce1', '#00a3e7', '#ffffff', '#000000'];

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
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'gapd-empty';
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
  card.className = 'gapd-card';

  // Image LEFT
  const imageWrap = document.createElement('div');
  imageWrap.className = 'gapd-image';
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
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Content RIGHT
  const content = document.createElement('div');
  content.className = 'gapd-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const chips = document.createElement('div');
  chips.className = 'gapd-chips';
  [item.series, item.category].filter(Boolean).forEach((txt) => {
    const chip = document.createElement('span');
    chip.className = 'gapd-chip';
    chip.textContent = txt;
    chips.appendChild(chip);
  });
  if (chips.childNodes.length) content.appendChild(chips);

  const title = document.createElement('h3');
  title.className = 'gapd-title';
  title.textContent = item.name;
  content.appendChild(title);

  if (item.model_number) {
    const model = document.createElement('div');
    model.className = 'gapd-model';
    model.textContent = item.model_number;
    content.appendChild(model);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'gapd-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  const meta = document.createElement('div');
  meta.className = 'gapd-meta';
  if (item.price != null && item.price !== '') {
    const price = document.createElement('span');
    price.className = 'gapd-price';
    const cur = item.currency && typeof item.price === 'number' ? `${item.currency} ` : '';
    price.textContent = `${cur}${item.price}`;
    meta.appendChild(price);
  }
  if (item.availability) {
    const avail = document.createElement('span');
    avail.className = 'gapd-avail';
    avail.textContent = item.availability;
    meta.appendChild(avail);
  }
  if (meta.childNodes.length) content.appendChild(meta);

  // Feature summary section
  const features = Array.isArray(item.key_features) ? item.key_features.slice(0, 3) : [];
  if (features.length) {
    const feats = document.createElement('ul');
    feats.className = 'gapd-features';
    features.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      feats.appendChild(li);
    });
    content.appendChild(feats);
  }

  // CTA row (max 2)
  const actions = document.createElement('div');
  actions.className = 'gapd-actions';

  const shopUrl = item.purchase_url || item.product_url;
  if (shopUrl && bridge) {
    const shop = document.createElement('button');
    shop.className = 'gapd-cta gapd-cta-primary';
    shop.type = 'button';
    shop.textContent = 'Shop This Model';
    shop.addEventListener('click', () => bridge.openLink(shopUrl));
    actions.appendChild(shop);
  }

  const whereUrl = item.product_url || item.purchase_url;
  if (whereUrl && bridge) {
    const where = document.createElement('button');
    where.className = 'gapd-cta gapd-cta-secondary';
    where.type = 'button';
    where.textContent = 'Where to Buy';
    where.addEventListener('click', () => bridge.openLink(whereUrl));
    actions.appendChild(where);
  }

  if (!bridge) {
    const shop = document.createElement('button');
    shop.className = 'gapd-cta gapd-cta-primary';
    shop.type = 'button';
    shop.textContent = 'Shop This Model';
    actions.appendChild(shop);
  }

  if (actions.childNodes.length) content.appendChild(actions);

  card.appendChild(content);
  block.appendChild(card);
}
