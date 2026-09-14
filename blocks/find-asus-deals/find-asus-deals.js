// codegen:layout-pattern=deals-carousel
// Sample data for standalone/preview mode. In production, data comes from bridge.toolResult.
const SAMPLE_DATA = [{"name": "ASUS Zenbook A16 (UX3607)", "description": "Ultra-lightweight 16-inch 3K OLED Copilot+ laptop with Snapdragon X2 Elite Extreme and 21+ hours of battery life.", "image_url": "https://dlcdnwebimgs.asus.com/gain/c5590f5d-0618-41e1-8f79-d8746a3e7301/", "price": "$1,799.99", "category": "Laptop", "series": "Zenbook", "availability": "In stock"}, {"name": "ASUS Vivobook S16 (S5608, Qualcomm)", "description": "16-inch portable Copilot+ laptop powered by Snapdragon X with an ASUS OLED display and 25+ hour battery life.", "image_url": "https://dlcdnwebimgs.asus.com/gain/d83e6089-8343-4639-803e-d3c3df3e058b/", "category": "Laptop", "series": "Vivobook", "availability": "In stock"}, {"name": "ProArt Display OLED PA32UCDM", "description": "31.5-inch 4K UHD OLED creator monitor with 240 Hz, 1000 nits, true 10-bit color, HDR and dual Thunderbolt 4.", "image_url": "https://dlcdnwebimgs.asus.com/gain/43466cec-c87f-4cc1-b1d9-3bbf4a232591/", "price": "$1,699.00", "category": "Monitor", "series": "ProArt", "availability": "In stock"}, {"name": "ASUS TUF Gaming GeForce RTX 5080 16GB GDDR7 OC Edition", "description": "NVIDIA Blackwell RTX 5080 graphics card with military-grade components, large vapor chamber cooling and Axial-tech fans.", "image_url": "https://dlcdnwebimgs.asus.com/gain/7bb494af-8636-46a3-93ee-3cff60d30624/", "price": "$1,899.99", "category": "Graphics Card", "series": "TUF Gaming", "availability": "In stock"}, {"name": "TUF Gaming BE9400", "description": "WiFi 7 gaming router delivering up to 9400 Mbps, 320 MHz channels, MLO, 2.5G ports and low-latency gaming with built-in security.", "image_url": "https://dlcdnwebimgs.asus.com/gain/c0f1ca04-9b10-43e6-a7bb-dc00183051a7/", "price": "$219.99", "category": "Router", "series": "TUF Gaming", "availability": "In stock"}, {"name": "ASUS RT-BE9700", "description": "Tri-band WiFi 7 router with 320 MHz and MLO, a 10G WAN port, quad 2.5G LAN ports, strong security and seamless AiMesh coverage.", "image_url": "https://dlcdnwebimgs.asus.com/gain/89469564-a89a-4a8e-9686-aa10e9b10718/", "price": "$249.99", "category": "Router", "series": "RT", "availability": "In stock"}, {"name": "ASUS Zenbook A14 (UX3407)", "description": "Ultra-light Copilot+ laptop, now on sale from its regular price.", "image_url": "https://dlcdnwebimgs.asus.com/gain/daf7ed78-fcec-4f54-82a6-db3204fdece3/w800/fwebp", "price": "$1,099.99", "original_price": "$1,599.99", "discount_percentage": "31% OFF", "category": "Laptop", "series": "Zenbook", "is_deal": true, "availability": "In stock"}, {"name": "ProArt PX13 (HN7306)", "description": "14-inch ProArt Copilot+ creator laptop discounted from its regular price.", "image_url": "https://dlcdnwebimgs.asus.com/gain/26a64d9f-c6c2-4263-ac47-69b2104ebcfe/w800/fwebp", "price": "$2,399.99", "original_price": "$2,799.99", "discount_percentage": "14% OFF", "category": "Laptop", "series": "ProArt", "is_deal": true, "availability": "In stock"}, {"name": "ASUS VA24EHF2", "description": "24-inch Full HD 100 Hz eye-care monitor on sale.", "image_url": "https://dlcdnwebimgs.asus.com/gain/308e1cc1-62e2-4288-85c8-cd11d749d61c/w800/fwebp", "price": "$79.00", "original_price": "$109.00", "discount_percentage": "28% OFF", "category": "Monitor", "series": "Eye Care", "is_deal": true, "availability": "In stock"}, {"name": "PRIME B550M-K WIFI", "description": "Micro-ATX AMD B550 motherboard with WiFi, discounted from its regular price.", "image_url": "https://dlcdnwebimgs.asus.com/gain/10d60cd3-a7ba-4a44-a399-e6509309447f/w800/fwebp", "price": "$79.99", "original_price": "$89.99", "discount_percentage": "11% OFF", "category": "Motherboard", "series": "Prime", "is_deal": true, "availability": "In stock"}];

// Brand colors from ASUS design tokens (accent #006ce1). getThemedCardBg darkens PALETTE[0]
// to luminance <= 0.12 so white card text meets WCAG AA.
const PALETTE = ['#006ce1', '#00a3e7', '#0051a8'];
const CARD_COLORS = ['#1a2a3a', '#1a3a2a', '#2a1a3a', '#3a2a1a', '#1a1a3a', '#3a1a1a', '#2a3a1a', '#3a1a2a'];

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
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

function fmtPrice(v) {
  if (v === undefined || v === null || v === '') return '';
  if (typeof v === 'number') return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return String(v);
}

function priceOf(item) { return item.current_price !== undefined ? item.current_price : item.price; }
function prevPriceOf(item) { return item.previous_price !== undefined ? item.previous_price : item.original_price; }
function discountOf(item) {
  if (item.discount_percentage) return String(item.discount_percentage);
  const cur = priceOf(item), prev = prevPriceOf(item);
  const n = (x) => typeof x === 'number' ? x : parseFloat(String(x || '').replace(/[^0-9.]/g, ''));
  const c = n(cur), p = n(prev);
  if (c && p && p > c) return Math.round((1 - c / p) * 100) + '% OFF';
  return '';
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.deals — derived from action name "find_asus_deals" (bare array outputSchema rule)
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;
  // AMCP-360 is_deal partition (concept=deals-list): keep only deal items in preview's mixed
  // sample array. Production handler returns deal objects flagged is_deal:true.
  items = items.filter((it) => it.is_deal === true);
  if (!items.length) items = SAMPLE_DATA.filter((it) => it.is_deal === true);

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

function renderDeals(block, allItems, bridge) {
  const root = document.createElement('div');
  root.className = 'find-asus-deals-root';

  // Filter chips (category)
  const categories = ['All'].concat(Array.from(new Set(allItems.map((it) => it.category).filter(Boolean))));
  const chipBar = document.createElement('div');
  chipBar.className = 'find-asus-deals-chips';
  let activeCat = 'All';

  const track = document.createElement('div');
  track.className = 'find-asus-deals-track';

  const renderCards = () => {
    track.textContent = '';
    const visible = allItems.filter((it) => activeCat === 'All' || it.category === activeCat);
    visible.slice(0, 8).forEach((item, i) => track.appendChild(buildCard(item, i, bridge)));
    requestAnimationFrame(updateArrows);
  };

  categories.forEach((cat) => {
    const chip = document.createElement('button');
    chip.className = 'find-asus-deals-chip';
    chip.type = 'button';
    chip.textContent = cat;
    if (cat === activeCat) chip.classList.add('is-active');
    chip.setAttribute('aria-pressed', cat === activeCat ? 'true' : 'false');
    chip.addEventListener('click', () => {
      activeCat = cat;
      Array.from(chipBar.children).forEach((c) => {
        const on = c.textContent === activeCat;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderCards();
    });
    chipBar.appendChild(chip);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'find-asus-deals-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'find-asus-deals-arrow find-asus-deals-arrow-left';
  btnLeft.type = 'button';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'find-asus-deals-track-wrap';

  const fade = document.createElement('div');
  fade.className = 'find-asus-deals-fade';
  fade.style.background = 'linear-gradient(to right, transparent, ' + (theme ? theme.bg : '#0a1a2a') + 'cc)';

  const btnRight = document.createElement('button');
  btnRight.className = 'find-asus-deals-arrow find-asus-deals-arrow-right';
  btnRight.type = 'button';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);

  root.appendChild(chipBar);
  root.appendChild(wrapper);
  block.appendChild(root);

  const cardWidth = 220 + 16;
  const scrollLeft = () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  const scrollRight = () => track.scrollBy({ left: cardWidth, behavior: 'smooth' });
  btnLeft.addEventListener('click', scrollLeft);
  btnRight.addEventListener('click', scrollRight);
  const keyScroll = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
  btnLeft.addEventListener('keydown', keyScroll(scrollLeft));
  btnRight.addEventListener('keydown', keyScroll(scrollRight));

  function updateArrows() {
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    btnLeft.style.display = atStart ? 'none' : 'flex';
    btnRight.style.display = atEnd ? 'none' : 'flex';
  }
  track.addEventListener('scroll', updateArrows);

  renderCards();
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'find-asus-deals-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'find-asus-deals-img';

  const disc = discountOf(item);
  if (disc) {
    const badge = document.createElement('span');
    badge.className = 'find-asus-deals-discount';
    badge.textContent = disc;
    imgWrap.appendChild(badge);
  }

  const fallback = () => {
    const d = document.createElement('div');
    d.style.cssText = 'width:100%;height:100%;background:' + CARD_COLORS[i % CARD_COLORS.length] + ';';
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(fallback(), img); };
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(fallback());
  }
  card.appendChild(imgWrap);

  const info = document.createElement('div');
  info.className = 'find-asus-deals-info';
  info.style.cssText = 'background:' + (theme ? theme.bg : '#0a1a2a') + ';color:' + (theme ? theme.fg : '#fff') + ';';

  const name = document.createElement('div');
  name.className = 'find-asus-deals-name';
  name.textContent = item.name || '';
  info.appendChild(name);

  const priceRow = document.createElement('div');
  priceRow.className = 'find-asus-deals-price-row';
  const prev = prevPriceOf(item);
  if (prev) {
    const was = document.createElement('span');
    was.className = 'find-asus-deals-was';
    was.textContent = fmtPrice(prev);
    priceRow.appendChild(was);
  }
  const now = document.createElement('span');
  now.className = 'find-asus-deals-now';
  now.textContent = fmtPrice(priceOf(item));
  priceRow.appendChild(now);
  info.appendChild(priceRow);

  const meta = document.createElement('div');
  meta.className = 'find-asus-deals-meta';
  const parts = [];
  if (item.category) parts.push(item.category);
  if (item.deal_type) parts.push(item.deal_type);
  if (item.availability) parts.push(item.availability);
  meta.textContent = parts.join(' · ');
  info.appendChild(meta);

  if (item.offer_terms || item.expiration_date) {
    const terms = document.createElement('div');
    terms.className = 'find-asus-deals-terms';
    terms.textContent = item.offer_terms || ('Ends ' + item.expiration_date);
    info.appendChild(terms);
  }

  const cta = document.createElement('button');
  cta.className = 'find-asus-deals-cta';
  cta.type = 'button';
  cta.textContent = 'Shop Deal';
  if (bridge) {
    const url = item.purchase_url || item.product_url || item.url;
    cta.addEventListener('click', () => {
      if (url) bridge.openLink(url);
      else bridge.sendMessage('Tell me more about ' + (item.name || 'this deal'));
    });
  }
  info.appendChild(cta);

  card.appendChild(info);
  return card;
}
