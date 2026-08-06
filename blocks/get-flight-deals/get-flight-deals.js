// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Guayaquil', destination: 'Guayaquil', description: 'Round-trip flights to Guayaquil, Ecuador with Avianca and earn Lifemiles.', price: 'USD 236', category: 'Ecuador', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/GYE/Destination%20Card/d96018c6-3eef-4a75-ab2d-681e1b8a5060' },
  { name: 'San José, Costa Rica', destination: 'San José, Costa Rica', description: "Round-trip flights to San José, Costa Rica across Avianca's network.", price: 'USD 308', category: 'Costa Rica', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/SJO/Destination%20Card/24719518-874b-4749-b4d7-2750e2b4e22c' },
  { name: 'Riohacha', destination: 'Riohacha', description: 'Round-trip flights to the Caribbean coastal city of Riohacha, Colombia.', price: 'USD 309', category: 'Colombia', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/RCH/Destination%20Card/135aac94-1497-4752-ae45-13ee0f52bfc4' },
  { name: 'São Paulo', destination: 'São Paulo', description: 'Round-trip flights to São Paulo, Brazil with Avianca.', price: 'USD 340', category: 'Brazil', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/GRU/Destination%20Card/ffa61036-0fe3-4a3e-9beb-5ddb169fabbe' },
  { name: 'Barranquilla', destination: 'Barranquilla', description: "Round-trip flights to Barranquilla on Colombia's Caribbean coast.", price: 'USD 357', category: 'Colombia', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/BAQ/Destination%20Card/e74a2f92-d11c-4e34-8910-52c288eca1f9' },
  { name: 'Managua', destination: 'Managua', description: 'Discounted round-trip fares to Managua, Nicaragua.', price: 'USD 330', category: 'Nicaragua', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/MGA/Destination%20Card/0a489f17-0d27-415e-9665-798dc479b5cf', is_deal: true },
  { name: 'Valledupar', destination: 'Valledupar', description: 'Discounted round-trip fares to Valledupar, Colombia.', price: 'USD 344', category: 'Colombia', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/VUP/Destination%20Card/0cd96367-10ba-489c-a385-6f79bb6976a5', is_deal: true },
  { name: 'Pereira', destination: 'Pereira', description: "Discounted round-trip fares to Pereira in Colombia's coffee region.", price: 'USD 353', category: 'Colombia', image_url: 'https://apairmarketingstoragepro.blob.core.windows.net/media/Avianca/Cities/PEI/Destination%20Card/3418539e-4916-4725-85da-2748cc747e4b', is_deal: true },
];

const CONCEPT = 'deals-list';

// Brand palette from the action payload.
const PALETTE = ['#3860be', '#1b1b1b'];

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
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
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
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_flight_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  // AMCP-360 is_deal partition — deals-list shows ONLY deal items.
  items = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));

  block.textContent = '';
  renderDeals(block, items, bridge);

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

function renderDeals(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'get-flight-deals-wrapper';

  const track = document.createElement('div');
  track.className = 'get-flight-deals-track';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'get-flight-deals-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'get-flight-deals-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || item.destination || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const badge = document.createElement('span');
    badge.className = 'get-flight-deals-badge';
    badge.textContent = 'Deal';
    imageContainer.appendChild(badge);

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'get-flight-deals-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'get-flight-deals-name';
    title.textContent = item.name || item.destination || '';
    info.appendChild(title);

    const category = document.createElement('span');
    category.className = 'get-flight-deals-category';
    category.textContent = item.category || '';
    info.appendChild(category);

    const price = document.createElement('span');
    price.className = 'get-flight-deals-price';
    price.textContent = item.price || '';
    info.appendChild(price);

    const btn = document.createElement('button');
    btn.className = 'get-flight-deals-cta';
    btn.type = 'button';
    btn.textContent = 'View Deal';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name || item.destination} flight deal`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'get-flight-deals-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `get-flight-deals-arrow get-flight-deals-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.addEventListener('click', () => {
      const cardW = track.querySelector('.get-flight-deals-card')?.offsetWidth || 220;
      track.scrollBy({ left: dir === 'left' ? -(cardW + 16) : cardW + 16, behavior: 'smooth' });
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftArrow.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
