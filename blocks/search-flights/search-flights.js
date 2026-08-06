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

// Brand palette from the action payload — used to derive card info-strip background.
const PALETTE = ['#3860be', '#1b1b1b'];

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo);
  const dg = Math.round(g * lo);
  const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

function renderItems(block, items, bridge) {
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'search-flights-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'search-flights-arrow search-flights-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'search-flights-track-wrap';

  const track = document.createElement('div');
  track.className = 'search-flights-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'search-flights-arrow search-flights-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'search-flights-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;

  items.slice(0, 8).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-flights-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'search-flights-img';
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
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'search-flights-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'search-flights-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.description) {
      const desc = document.createElement('div');
      desc.className = 'search-flights-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'search-flights-price-row';
    if (item.price) {
      const price = document.createElement('span');
      price.className = 'search-flights-price';
      price.textContent = item.price;
      priceRow.appendChild(price);
    }
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-flights-badge';
      badge.textContent = item.category;
      priceRow.appendChild(badge);
    }
    info.appendChild(priceRow);

    const cta = document.createElement('button');
    cta.className = 'search-flights-cta';
    cta.textContent = 'Search flights';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Search Avianca flights to ${item.name || item.destination || ''}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);
  block.appendChild(wrapper);

  const cardWidth = 220 + 16;
  btnLeft.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  btnRight.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
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
      // structuredContent.flights — bare array outputSchema; key derived from actionName "search_flights"
      items = structuredContent?.flights || [];
    }
  } else {
    items = SAMPLE_DATA;
  }
  if (!items || !items.length) items = SAMPLE_DATA;

  // AMCP-360 is_deal partition: non-deals-list concepts exclude deal items.
  items = items.filter((it) => it.is_deal !== true);

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
