// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    product_id: '391149',
    name: 'Pantofi alergare barbati Hoka Clifton 11 Wide',
    brand: 'Hoka',
    image_url: 'https://media.sportguru.ro/media/catalog/product/4/0/403498_1_1.jpg',
    current_price: 835,
    stock_status: 'In Stock',
    available_variants: ['42', '42 2/3', '43 1/3', '44', '44 2/3', '45 1/3', '46', '46 2/3', '47 1/3'],
    intended_use: 'Daily training / long runs',
    key_specifications: {
      Terrain: 'Road',
      Cushioning: 'Max cushioning (soft compression-molded EVA)',
      Fit: 'Wide',
    },
    strengths: ['Plush max cushioning for easy daily miles', 'Wide fit accommodates broader feet', 'Best in-stock price of the three'],
    tradeoffs: ['Softer foam is less responsive for faster efforts', 'Heavier than tempo-oriented trainers'],
    fit_summary: 'A soft, forgiving daily trainer that suits relaxed easy runs on the road.',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-hoka-clifton-11-wide',
  },
  {
    product_id: 'mizuno-horizon-9-m',
    name: 'Pantofi alergare barbati Mizuno Wave Horizon 9 FW 2026',
    brand: 'Mizuno',
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/h/sh_j1gc262652_11_1__1_1.jpg',
    current_price: 906.3,
    stock_status: 'In Stock',
    available_variants: [],
    intended_use: 'Daily training',
    key_specifications: {
      Terrain: 'Road',
      Cushioning: 'Stability / supportive',
      Fit: 'Standard',
    },
    strengths: ['Supportive stability structure for overpronation', 'Balanced daily-training cushioning', '10% off original price'],
    tradeoffs: ['Firmer, more structured ride than a neutral shoe', 'Extra support adds weight'],
    fit_summary: 'A supportive daily trainer for easy runs when you want guidance underfoot.',
    product_url: 'https://www.sportguru.ro/pantofi-alergare-barbati-mizuno-wave-horizon-9-fw-2026',
  },
  {
    product_id: 'nike-vomero-premium-w',
    name: 'Pantofi alergare dama Nike Vomero Premium SS 2026',
    brand: 'Nike',
    image_url: 'https://media.sportguru.ro/media/catalog/product/w/_/w_nike_vomero_premium_2__1_2.jpg',
    current_price: 974,
    stock_status: 'In Stock',
    available_variants: [],
    intended_use: 'Easy / daily runs',
    key_specifications: {
      Terrain: 'Road',
      Cushioning: 'Max cushioning',
      Fit: 'Standard',
    },
    strengths: ['Premium max cushioning for easy-run comfort', 'Biggest discount (20% off)', 'Smooth road ride'],
    tradeoffs: ['Highest current price', 'Premium build is on the heavier side'],
    fit_summary: 'A plush premium option tuned specifically for easy and daily road runs.',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-nike-vomero-premium-ss-2026',
  },
];

// Brand palette from the action payload.
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
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#6100A2';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function fmtPrice(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;
}

export default async function decorate(block, bridge) {
  let products;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      products = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.products — bare array outputSchema; key derived from actionName "compare_sports_products"
      products = structuredContent?.products || [];
    }
  } else {
    products = SAMPLE_DATA;
  }

  block.textContent = '';
  renderComparison(block, Array.isArray(products) ? products.slice(0, 4) : [], bridge);

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

function makeCell(tag, text, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

function collectSpecKeys(products) {
  const keys = [];
  products.forEach((p) => {
    const specs = p.key_specifications || {};
    Object.keys(specs).forEach((k) => { if (!keys.includes(k)) keys.push(k); });
  });
  return keys;
}

function renderComparison(block, products, bridge) {
  const wrap = document.createElement('div');
  wrap.className = 'csp-wrap';

  if (!products.length) {
    const empty = makeCell('p', 'No products were available to compare.', 'csp-empty');
    wrap.appendChild(empty);
    block.appendChild(wrap);
    return;
  }

  const scroller = document.createElement('div');
  scroller.className = 'csp-scroller';

  const table = document.createElement('table');
  table.className = 'csp-table';

  const specKeys = collectSpecKeys(products);

  // Header row: product image + name + brand
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(makeCell('th', '', 'csp-rowlabel'));
  products.forEach((p, i) => {
    const th = document.createElement('th');
    th.className = 'csp-prodhead';

    const imgBox = document.createElement('div');
    imgBox.className = 'csp-imgbox';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (p.image_url) {
      const img = document.createElement('img');
      img.src = p.image_url;
      img.alt = p.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imgBox.appendChild(img);
    } else {
      imgBox.appendChild(colorDiv());
    }
    th.appendChild(imgBox);

    if (p.brand) th.appendChild(makeCell('div', p.brand, 'csp-brand'));
    th.appendChild(makeCell('div', p.name || '', 'csp-name'));
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const addRow = (label, cellFn) => {
    const tr = document.createElement('tr');
    tr.appendChild(makeCell('th', label, 'csp-rowlabel'));
    products.forEach((p, i) => {
      const td = document.createElement('td');
      cellFn(td, p, i);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  };

  addRow('Price', (td, p) => {
    const price = makeCell('span', fmtPrice(p.current_price), 'csp-price');
    td.appendChild(price);
  });

  addRow('Availability', (td, p) => {
    const chip = makeCell('span', p.stock_status || '—', 'csp-chip');
    td.appendChild(chip);
  });

  addRow('Variants', (td, p) => {
    const v = Array.isArray(p.available_variants) ? p.available_variants : [];
    td.textContent = v.length ? v.join(', ') : '—';
  });

  addRow('Intended use', (td, p) => {
    td.textContent = p.intended_use || '—';
  });

  specKeys.forEach((key) => {
    addRow(key, (td, p) => {
      const val = (p.key_specifications || {})[key];
      td.textContent = val != null && val !== '' ? String(val) : '—';
    });
  });

  addRow('Strengths', (td, p) => {
    const list = Array.isArray(p.strengths) ? p.strengths : [];
    if (!list.length) { td.textContent = '—'; return; }
    const ul = document.createElement('ul');
    ul.className = 'csp-list csp-pro';
    list.forEach((s) => ul.appendChild(makeCell('li', s)));
    td.appendChild(ul);
  });

  addRow('Tradeoffs', (td, p) => {
    const list = Array.isArray(p.tradeoffs) ? p.tradeoffs : [];
    if (!list.length) { td.textContent = '—'; return; }
    const ul = document.createElement('ul');
    ul.className = 'csp-list csp-con';
    list.forEach((s) => ul.appendChild(makeCell('li', s)));
    td.appendChild(ul);
  });

  addRow('Fit', (td, p) => {
    td.textContent = p.fit_summary || '—';
  });

  // CTA row
  const ctaRow = document.createElement('tr');
  ctaRow.appendChild(makeCell('th', '', 'csp-rowlabel'));
  products.forEach((p) => {
    const td = document.createElement('td');
    const box = document.createElement('div');
    box.className = 'csp-ctabox';

    const view = document.createElement('button');
    view.className = 'csp-btn csp-btn-primary';
    view.type = 'button';
    view.textContent = 'View Product';
    view.style.background = ACCENT;
    if (bridge && p.product_url) {
      view.addEventListener('click', () => bridge.openLink(p.product_url));
    }
    box.appendChild(view);

    const choose = document.createElement('button');
    choose.className = 'csp-btn csp-btn-secondary';
    choose.type = 'button';
    choose.textContent = 'Choose This Product';
    if (bridge) {
      choose.addEventListener('click', () => bridge.sendMessage(`I'd like to go with the ${p.name}. Can you help me with the next step?`));
    }
    box.appendChild(choose);

    td.appendChild(box);
    ctaRow.appendChild(td);
  });
  tbody.appendChild(ctaRow);

  table.appendChild(tbody);
  scroller.appendChild(table);
  wrap.appendChild(scroller);

  // Summary — best match per priority
  const summary = buildSummary(products);
  if (summary.length) {
    const sumBox = document.createElement('div');
    sumBox.className = 'csp-summary';
    sumBox.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
    const h = makeCell('div', 'Best match by priority', 'csp-summary-title');
    sumBox.appendChild(h);
    summary.forEach(({ label, value }) => {
      const row = document.createElement('div');
      row.className = 'csp-summary-row';
      row.appendChild(makeCell('span', label, 'csp-summary-label'));
      row.appendChild(makeCell('span', value, 'csp-summary-value'));
      sumBox.appendChild(row);
    });
    wrap.appendChild(sumBox);
  }

  block.appendChild(wrap);
}

function buildSummary(products) {
  const out = [];
  const priced = products.filter((p) => Number(p.current_price) >= 0 && p.current_price != null);
  if (priced.length) {
    const cheapest = priced.reduce((a, b) => (Number(a.current_price) <= Number(b.current_price) ? a : b));
    out.push({ label: 'Best price', value: cheapest.name });
  }
  const maxCush = products.find((p) => /max/i.test((p.key_specifications || {}).Cushioning || p.cushioning || ''));
  if (maxCush) out.push({ label: 'Most cushioning', value: maxCush.name });
  const stability = products.find((p) => /stab|support/i.test((p.key_specifications || {}).Cushioning || ''));
  if (stability) out.push({ label: 'Most support', value: stability.name });
  const easy = products.find((p) => /easy|daily/i.test(p.intended_use || ''));
  if (easy) out.push({ label: 'Best for easy runs', value: easy.name });
  return out;
}
