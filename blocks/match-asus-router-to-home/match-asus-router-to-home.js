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
  { name: 'ASUS Zenbook A14 (UX3407)', description: 'Ultra-light Copilot+ laptop, now on sale from its regular price.', image_url: 'https://dlcdnwebimgs.asus.com/gain/daf7ed78-fcec-4f54-82a6-db3204fdece3/w800/fwebp', price: '$1,099.99', original_price: '$1,599.99', discount_percentage: '31% OFF', category: 'Laptop', series: 'Zenbook', is_deal: true, availability: 'In stock' },
  { name: 'ProArt PX13 (HN7306)', description: '14-inch ProArt Copilot+ creator laptop discounted from its regular price.', image_url: 'https://dlcdnwebimgs.asus.com/gain/26a64d9f-c6c2-4263-ac47-69b2104ebcfe/w800/fwebp', price: '$2,399.99', original_price: '$2,799.99', discount_percentage: '14% OFF', category: 'Laptop', series: 'ProArt', is_deal: true, availability: 'In stock' },
  { name: 'ASUS VA24EHF2', description: '24-inch Full HD 100 Hz eye-care monitor on sale.', image_url: 'https://dlcdnwebimgs.asus.com/gain/308e1cc1-62e2-4288-85c8-cd11d749d61c/w800/fwebp', price: '$79.00', original_price: '$109.00', discount_percentage: '28% OFF', category: 'Monitor', series: 'Eye Care', is_deal: true, availability: 'In stock' },
  { name: 'PRIME B550M-K WIFI', description: 'Micro-ATX AMD B550 motherboard with WiFi, discounted from its regular price.', image_url: 'https://dlcdnwebimgs.asus.com/gain/10d60cd3-a7ba-4a44-a399-e6509309447f/w800/fwebp', price: '$79.99', original_price: '$89.99', discount_percentage: '11% OFF', category: 'Motherboard', series: 'Prime', is_deal: true, availability: 'In stock' },
];

// Brand colors from DESIGN_TOKENS (ASUS Incisive Blue).
const PALETTE = ['#006ce1', '#00a3e7', '#0051a8'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
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
      // structuredContent.routers — bare array outputSchema; key derived from actionName "match_asus_router_to_home"
      items = structuredContent?.routers || [];
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
  wrapper.className = 'match-asus-router-to-home-carousel-wrap';

  const track = document.createElement('div');
  track.className = 'match-asus-router-to-home-track';

  (items || []).slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'match-asus-router-to-home-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'match-asus-router-to-home-img';
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
    info.className = 'match-asus-router-to-home-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'match-asus-router-to-home-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    const specParts = [];
    if (item.wifi_generation) specParts.push(item.wifi_generation);
    if (item.speed_class) specParts.push(item.speed_class);
    if (item.bands) specParts.push(item.bands);
    const specText = specParts.length ? specParts.join(' · ') : (item.description || '');
    if (specText) {
      const spec = document.createElement('p');
      spec.className = 'match-asus-router-to-home-spec';
      spec.textContent = specText;
      info.appendChild(spec);
    }

    const fitReasons = Array.isArray(item.fit_reasons) ? item.fit_reasons.slice(0, 3) : [];
    if (fitReasons.length) {
      const fitList = document.createElement('ul');
      fitList.className = 'match-asus-router-to-home-fit';
      fitReasons.forEach((reason) => {
        const li = document.createElement('li');
        li.textContent = reason;
        fitList.appendChild(li);
      });
      info.appendChild(fitList);
    }

    const metaRow = document.createElement('div');
    metaRow.className = 'match-asus-router-to-home-meta';
    if (item.price != null && item.price !== '') {
      const price = document.createElement('span');
      price.className = 'match-asus-router-to-home-price';
      price.textContent = typeof item.price === 'number'
        ? `${item.currency ? `${item.currency} ` : '$'}${item.price}`
        : item.price;
      metaRow.appendChild(price);
    }
    const typeText = item.router_type || item.category;
    if (typeText) {
      const badge = document.createElement('span');
      badge.className = 'match-asus-router-to-home-badge';
      badge.textContent = typeText;
      metaRow.appendChild(badge);
    }
    if (metaRow.childNodes.length) info.appendChild(metaRow);

    const cta = document.createElement('button');
    cta.className = 'match-asus-router-to-home-cta';
    cta.type = 'button';
    cta.textContent = 'View Router';
    if (bridge) {
      cta.addEventListener('click', () => {
        const url = item.product_url || item.purchase_url;
        if (url) bridge.openLink(url);
        else bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'match-asus-router-to-home-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;

  const scrollByCard = (dir) => {
    const card = track.querySelector('.match-asus-router-to-home-card');
    const delta = (card ? card.offsetWidth : 220) + 16;
    track.scrollBy({ left: dir * delta, behavior: 'smooth' });
  };

  const leftBtn = document.createElement('button');
  leftBtn.type = 'button';
  leftBtn.className = 'match-asus-router-to-home-arrow match-asus-router-to-home-arrow-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  const rightBtn = document.createElement('button');
  rightBtn.type = 'button';
  rightBtn.className = 'match-asus-router-to-home-arrow match-asus-router-to-home-arrow-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const handleKey = (fn) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
  };
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  leftBtn.addEventListener('keydown', handleKey(() => scrollByCard(-1)));
  rightBtn.addEventListener('keydown', handleKey(() => scrollByCard(1)));

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);
  requestAnimationFrame(updateArrows);
}
