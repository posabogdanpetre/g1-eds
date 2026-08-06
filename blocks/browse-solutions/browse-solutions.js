// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'V.A.C. Therapy (Negative Pressure Wound Therapy)',
    description: 'Clinically-proven negative pressure wound therapy system that promotes wound healing and helps protect against external contamination.',
    image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/msd-actwc-vacpnp-photo-home-nurse3-gbl?qlt=85&ts=1785362348351&dpr=off',
    category: 'Advanced Wound Care',
  },
  {
    name: 'Cavilon Skin Care Solutions',
    description: 'Barrier films and creams built on skin science technology to maintain skin integrity, help prevent infections, and support skin repair.',
    image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/med-people-nurse-cavilon-advanced-003-900x450%3AXL--large-desktop?ts=1727100093789&cropN=0,.1,1,1&flip=lr&dpr=off',
    category: 'Advanced Wound Care',
  },
  {
    name: 'Ioban 2 Antimicrobial Incise Drapes',
    description: 'Iodophor-impregnated surgical incise drapes that immobilize bacteria at the incision site to help reduce surgical site infection risk.',
    image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/ioban-chg-drape-abdomen-app004-ms-ss-en?qlt=85&ts=1775571953007&dpr=off',
    category: 'Surgical Solutions',
  },
  {
    name: 'Curos Disinfecting Port Protectors',
    description: 'Alcohol-impregnated caps that disinfect and protect IV access points to help reduce the risk of catheter-related infections.',
    image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/CFF1-270-pkg100?wid=800&hei=600',
    category: 'IV Site Management',
  },
  {
    name: 'Liqui-Cel EXF Membrane Contactors',
    description: 'Membrane contactor solutions for advanced dissolved gas control, removing gases from process water and biopharmaceutical manufacturing streams.',
    image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/b5005009009_exffamily_Frontside?wid=800&hei=600',
    category: 'Purification & Filtration',
  },
  {
    name: 'Fluency for Imaging',
    description: 'AI-powered radiology speech recognition software, ranked #1 Best in KLAS for five consecutive years, that streamlines imaging documentation workflows.',
    image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/ent-abst-rdr-5-rgb-gbl-1?qlt=85&ts=1741706025981&dpr=off',
    category: 'Health Information Technology',
  },
];

// Brand palette from the action payload — empty here, so getThemedCardBg falls back to #1a1a1a.
const PALETTE = [];

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

function renderItems(block, items, bridge) {
  const cardBg = theme?.bg ?? '#1a1a1a';
  const cardFg = theme?.fg ?? '#ffffff';

  const wrapper = document.createElement('div');
  wrapper.className = 'browse-solutions-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'browse-solutions-arrow browse-solutions-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'browse-solutions-track-wrap';

  const track = document.createElement('div');
  track.className = 'browse-solutions-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'browse-solutions-arrow browse-solutions-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'browse-solutions-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${cardBg}cc)`;

  items.slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'browse-solutions-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'browse-solutions-img';
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
    info.className = 'browse-solutions-info';
    info.style.cssText = `background:${cardBg};color:${cardFg};`;

    const name = document.createElement('div');
    name.className = 'browse-solutions-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.description) {
      const desc = document.createElement('div');
      desc.className = 'browse-solutions-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    if (item.category) {
      const badgeRow = document.createElement('div');
      badgeRow.className = 'browse-solutions-badge-row';
      const badge = document.createElement('span');
      badge.className = 'browse-solutions-badge';
      badge.textContent = item.category;
      badgeRow.appendChild(badge);
      info.appendChild(badgeRow);
    }

    const cta = document.createElement('button');
    cta.className = 'browse-solutions-cta';
    cta.textContent = 'View Details';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name || 'this solution'}`);
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
      // structuredContent.solutions — bare array outputSchema; key derived from actionName "browse_solutions"
      items = structuredContent?.solutions || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

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
