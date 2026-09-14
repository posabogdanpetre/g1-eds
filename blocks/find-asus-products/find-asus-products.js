// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'ASUS Zenbook A16 (UX3607)', description: 'Ultra-lightweight 16-inch 3K OLED Copilot+ laptop with Snapdragon X2 Elite Extreme and 21+ hours of battery life.', image_url: 'https://dlcdnwebimgs.asus.com/gain/c5590f5d-0618-41e1-8f79-d8746a3e7301/', price: '$1,799.99', category: 'Laptop', series: 'Zenbook', availability: 'In stock' },
  { name: 'ASUS Vivobook S16 (S5608, Qualcomm)', description: '16-inch portable Copilot+ laptop powered by Snapdragon X with an ASUS OLED display and 25+ hour battery life.', image_url: 'https://dlcdnwebimgs.asus.com/gain/d83e6089-8343-4639-803e-d3c3df3e058b/', category: 'Laptop', series: 'Vivobook', availability: 'In stock' },
  { name: 'ProArt Display OLED PA32UCDM', description: '31.5-inch 4K UHD OLED creator monitor with 240 Hz, 1000 nits, true 10-bit color, HDR and dual Thunderbolt 4.', image_url: 'https://dlcdnwebimgs.asus.com/gain/43466cec-c87f-4cc1-b1d9-3bbf4a232591/', price: '$1,699.00', category: 'Monitor', series: 'ProArt', availability: 'In stock' },
  { name: 'ASUS TUF Gaming GeForce RTX 5080 16GB GDDR7 OC Edition', description: 'NVIDIA Blackwell RTX 5080 graphics card with military-grade components, large vapor chamber cooling and Axial-tech fans.', image_url: 'https://dlcdnwebimgs.asus.com/gain/7bb494af-8636-46a3-93ee-3cff60d30624/', price: '$1,899.99', category: 'Graphics Card', series: 'TUF Gaming', availability: 'In stock' },
  { name: 'TUF Gaming BE9400', description: 'WiFi 7 gaming router delivering up to 9400 Mbps, 320 MHz channels, MLO, 2.5G ports and low-latency gaming with built-in security.', image_url: 'https://dlcdnwebimgs.asus.com/gain/c0f1ca04-9b10-43e6-a7bb-dc00183051a7/', price: '$219.99', category: 'Router', series: 'TUF Gaming', availability: 'In stock' },
  { name: 'ASUS RT-BE9700', description: 'Tri-band WiFi 7 router with 320 MHz and MLO, a 10G WAN port, quad 2.5G LAN ports, strong security and seamless AiMesh coverage.', image_url: 'https://dlcdnwebimgs.asus.com/gain/89469564-a89a-4a8e-9686-aa10e9b10718/', price: '$249.99', category: 'Router', series: 'RT', availability: 'In stock' },
];

const CONCEPT = 'product-list';

// Brand colors from ASUS design tokens (Step 1c). getThemedCardBg() darkens PALETTE[0]
// to luminance <= 0.12 so white text on the card info strip has WCAG AA contrast.
const PALETTE = ['#006ce1', '#00a3e7', '#0051a8'];
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
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

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
      // structuredContent.products — bare array outputSchema; key derived from actionName "find_asus_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  // AMCP-360 is_deal partition — product-list excludes deal items (deals-list would keep only them).
  items = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));

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

function specList(item) {
  if (Array.isArray(item.key_specs) && item.key_specs.length) return item.key_specs.slice(0, 3);
  return [];
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
}

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'find-asus-products-carousel-wrap';

  const track = document.createElement('div');
  track.className = 'find-asus-products-track';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'find-asus-products-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'find-asus-products-img';
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
    info.className = 'find-asus-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('h3');
    name.className = 'find-asus-products-name';
    name.textContent = truncate(item.name || '', 40);
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'find-asus-products-meta';
    meta.textContent = [item.category, item.series].filter(Boolean).join(' · ');
    if (meta.textContent) info.appendChild(meta);

    const specs = specList(item);
    if (specs.length) {
      const ul = document.createElement('ul');
      ul.className = 'find-asus-products-specs';
      specs.forEach((s) => {
        const li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      info.appendChild(ul);
    } else if (item.short_description || item.description) {
      const desc = document.createElement('p');
      desc.className = 'find-asus-products-desc';
      desc.textContent = truncate(item.short_description || item.description, 92);
      info.appendChild(desc);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'find-asus-products-price-row';
    const price = document.createElement('span');
    price.className = 'find-asus-products-price';
    price.textContent = item.price ? (typeof item.price === 'number' ? `${item.currency || '$'}${item.price}` : item.price) : '';
    priceRow.appendChild(price);
    if (item.availability) {
      const avail = document.createElement('span');
      avail.className = 'find-asus-products-avail';
      avail.textContent = item.availability;
      priceRow.appendChild(avail);
    }
    info.appendChild(priceRow);

    const cta = document.createElement('button');
    cta.className = 'find-asus-products-cta';
    cta.type = 'button';
    cta.textContent = 'View Product';
    const nm = item.name || 'this product';
    cta.addEventListener('click', () => {
      if (!bridge) return;
      if (item.product_url) bridge.openLink(item.product_url);
      else if (item.purchase_url) bridge.openLink(item.purchase_url);
      else bridge.sendMessage(`Tell me more about ${nm}`);
    });
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'find-asus-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;

  const arrowL = document.createElement('button');
  arrowL.className = 'find-asus-products-arrow find-asus-products-arrow-left';
  arrowL.type = 'button';
  arrowL.setAttribute('aria-label', 'Scroll left');
  arrowL.textContent = '◀';
  const arrowR = document.createElement('button');
  arrowR.className = 'find-asus-products-arrow find-asus-products-arrow-right';
  arrowR.type = 'button';
  arrowR.setAttribute('aria-label', 'Scroll right');
  arrowR.textContent = '▶';

  const step = 236;
  const updateArrows = () => {
    arrowL.style.display = track.scrollLeft > 4 ? 'flex' : 'none';
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    arrowR.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  arrowL.addEventListener('click', () => track.scrollBy({ left: -step, behavior: 'smooth' }));
  arrowR.addEventListener('click', () => track.scrollBy({ left: step, behavior: 'smooth' }));
  track.addEventListener('scroll', updateArrows);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(arrowL);
  wrapper.appendChild(arrowR);
  block.appendChild(wrapper);
  requestAnimationFrame(updateArrows);
}
