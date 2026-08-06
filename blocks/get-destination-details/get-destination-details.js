// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Guayaquil', destination: 'Guayaquil', description: 'Round-trip flights to Guayaquil, Ecuador with Avianca and earn Lifemiles.', price: 'USD 236', category: 'Ecuador', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/GYE/Destination%20Card/d96018c6-3eef-4a75-ab2d-681e1b8a5060' },
  { name: 'San José, Costa Rica', destination: 'San José, Costa Rica', description: "Round-trip flights to San José, Costa Rica across Avianca's network.", price: 'USD 308', category: 'Costa Rica', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/SJO/Destination%20Card/24719518-874b-4749-b4d7-2750e2b4e22c' },
  { name: 'Riohacha', destination: 'Riohacha', description: 'Round-trip flights to the Caribbean coastal city of Riohacha, Colombia.', price: 'USD 309', category: 'Colombia', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/RCH/Destination%20Card/135aac94-1497-4752-ae45-13ee0f52bfc4' },
];

// Brand palette from the action payload — used to derive the content-panel background.
const PALETTE = ['#3860be', '#1b1b1b'];
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
const CTA_BG = PALETTE[1] || '#1b1b1b';

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'get-destination-details-card';

  const imgPanel = document.createElement('div');
  imgPanel.className = 'get-destination-details-image-panel';
  const imgSrc = item.image_url;
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = item.name || '';
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'get-destination-details-image-placeholder';
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    imgPanel.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.className = 'get-destination-details-image-placeholder';
    imgPanel.appendChild(d);
  }
  card.appendChild(imgPanel);

  const content = document.createElement('div');
  content.className = 'get-destination-details-content';
  content.style.background = theme ? theme.bg : '#1a2a4f';
  content.style.color = theme ? theme.fg : '#ffffff';

  const title = document.createElement('h2');
  title.className = 'get-destination-details-title';
  title.textContent = item.name || item.destination || '';
  content.appendChild(title);

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'get-destination-details-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'get-destination-details-description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'get-destination-details-price';
    const label = document.createElement('span');
    label.className = 'get-destination-details-price-label';
    label.textContent = 'Round-trip from';
    price.appendChild(label);
    price.appendChild(document.createTextNode(item.price));
    content.appendChild(price);
  }

  const cta = document.createElement('button');
  cta.className = 'get-destination-details-cta';
  cta.type = 'button';
  cta.textContent = 'Search flights';
  cta.style.background = CTA_BG;
  cta.style.color = '#fff';
  if (bridge) {
    cta.addEventListener('click', () => {
      const itemName = item.name || item.destination || 'this destination';
      bridge.sendMessage(`Search flights to ${itemName}`);
    });
  }
  content.appendChild(cta);
  card.appendChild(content);
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = Array.isArray(SAMPLE_DATA) ? SAMPLE_DATA[0] : SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = Array.isArray(SAMPLE_DATA) ? SAMPLE_DATA[0] : SAMPLE_DATA;
  }

  block.textContent = '';
  if (!item || !item.name) {
    const empty = document.createElement('p');
    empty.className = 'get-destination-details-empty';
    empty.textContent = 'No matching destination was found.';
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
