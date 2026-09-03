// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode (shaped like the tool's outputSchema).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Asics Gel-Kayano 32 Sunny Sizzle SS 2026',
    brand: 'Asics',
    current_price: 714,
    currency: 'Lei',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg',
    stock_status: 'In stoc',
    available_sizes: ['37', '38', '39', '40', '41'],
    collection_year: '2026',
    intended_use: 'Alergare pe drum, suport maxim',
    key_specifications: { Amortizare: 'FF Blast+ ECO', Suport: 'Stabilitate', Drop: '10 mm' },
    strengths: ['Suport maxim pentru pronatie', 'Amortizare fermă pe distanțe lungi'],
    tradeoffs: ['Mai grea decât un model neutru'],
    suitability_notes: 'Potrivită pentru rulaj zilnic cu nevoie de suport.',
  },
  {
    name: 'ON Cloudmonster 3 SS 2026',
    brand: 'ON',
    current_price: 765,
    currency: 'Lei',
    image_url: 'https://media.sportguru.ro/media/catalog/product/2/9/298c4e35e342e0c081ad5efe5ddb1eae61c660b9_gm_optimized.jpg',
    stock_status: 'In stoc',
    available_sizes: ['38', '39', '40', '41'],
    collection_year: '2026',
    intended_use: 'Alergare pe drum, amortizare maximă',
    key_specifications: { Amortizare: 'CloudTec Phase', Suport: 'Neutru', Drop: '6 mm' },
    strengths: ['Amortizare foarte moale', 'Revenire energică la fiecare pas'],
    tradeoffs: ['Suport lateral mai redus'],
    suitability_notes: 'Potrivită pentru confort și rulaj lejer.',
  },
];

// Brand palette from DESIGN_TOKENS (Velocity Signal): violet accent + lime-green CTA.
const PALETTE = ['#6100a2', '#3de525', '#000000'];
const CTA_BG = '#3de525';
const CTA_FG = '#6100a2';

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

const CARD_COLORS = ['#6100a2', '#3de525', '#0fb5ae', '#e68619', '#d83790', '#2dca72'];

function priceText(item) {
  const p = item.current_price ?? item.price;
  if (p == null || p === '') return '—';
  if (typeof p === 'number') return `${p.toLocaleString('ro-RO')} ${item.currency || 'Lei'}`;
  return String(p);
}

function joinVal(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return Object.entries(v).map(([k, val]) => `${k}: ${val}`).join(', ');
  return String(v);
}

function bestFit(item) {
  const use = item.intended_use || '';
  if (/suport|stabil/i.test(use + joinVal(item.key_specifications))) return 'Suport & stabilitate';
  if (/amortiz|confort|cushion/i.test(use + joinVal(item.key_specifications))) return 'Amortizare & confort';
  return item.brand || 'Alergare zilnică';
}

function buildPanel(item, i, bridge) {
  const panel = document.createElement('div');
  panel.className = 'csp-panel';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'csp-panel-img';
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
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(colorDiv());
  }
  panel.appendChild(imgWrap);

  const content = document.createElement('div');
  content.className = 'csp-panel-body';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.brand) {
    const brand = document.createElement('span');
    brand.className = 'csp-brand';
    brand.textContent = item.brand;
    content.appendChild(brand);
  }

  const name = document.createElement('h3');
  name.className = 'csp-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  const fit = document.createElement('span');
  fit.className = 'csp-fit';
  fit.textContent = `Best fit: ${bestFit(item)}`;
  content.appendChild(fit);

  panel.appendChild(content);
  return panel;
}

function renderComparison(block, items, bridge) {
  block.textContent = '';
  const pair = items.slice(0, 2);
  if (pair.length < 2) {
    const empty = document.createElement('p');
    empty.className = 'csp-empty';
    empty.textContent = 'Sunt necesare exact două produse pentru comparație.';
    block.appendChild(empty);
    return;
  }

  const container = document.createElement('div');
  container.className = 'csp-container';
  container.style.cssText = `--csp-bg:${theme?.bg ?? '#1a1a1a'};--csp-fg:${theme?.fg ?? '#fff'};`;

  // Header panels — leading spacer keeps the item1|item2 boundary aligned with the table columns
  const panels = document.createElement('div');
  panels.className = 'csp-panels';
  const panelSpacer = document.createElement('div');
  panelSpacer.className = 'csp-cta-spacer';
  panelSpacer.setAttribute('aria-hidden', 'true');
  panels.appendChild(panelSpacer);
  pair.forEach((item, i) => panels.appendChild(buildPanel(item, i, bridge)));
  container.appendChild(panels);

  // Attribute table
  const rows = [
    { label: 'Preț', get: (it) => priceText(it), lead: true },
    { label: 'Disponibil', get: (it) => joinVal(it.stock_status) },
    { label: 'Mărimi', get: (it) => joinVal(it.available_sizes) },
    { label: 'Utilizare', get: (it) => joinVal(it.intended_use) },
    { label: 'An', get: (it) => joinVal(it.collection_year) },
    { label: 'Specificații', get: (it) => joinVal(it.key_specifications) },
    { label: 'Puncte forte', get: (it) => joinVal(it.strengths) },
    { label: 'Compromisuri', get: (it) => joinVal(it.tradeoffs) },
  ].filter((r) => pair.some((it) => r.get(it)));

  const table = document.createElement('div');
  table.className = 'csp-table';
  rows.forEach((r, idx) => {
    const v0 = r.get(pair[0]);
    const v1 = r.get(pair[1]);
    if (String(v0).length > 60 || String(v1).length > 60) return;
    const row = document.createElement('div');
    row.className = `csp-row${idx % 2 ? ' csp-row-alt' : ''}${r.lead ? ' csp-row-lead' : ''}`;

    const label = document.createElement('div');
    label.className = 'csp-label';
    label.textContent = r.label;
    row.appendChild(label);

    const diff = v0 !== v1;
    [v0, v1].forEach((val) => {
      const cell = document.createElement('div');
      cell.className = `csp-cell${diff ? ' csp-diff' : ''}`;
      cell.textContent = val || '—';
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  container.appendChild(table);

  // CTA row — one "Choose This Product" per item
  const ctaRow = document.createElement('div');
  ctaRow.className = 'csp-cta-row';
  const spacer = document.createElement('div');
  spacer.className = 'csp-cta-spacer';
  ctaRow.appendChild(spacer);
  pair.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'csp-cta';
    btn.type = 'button';
    btn.textContent = 'Choose This Product';
    if (bridge) {
      btn.addEventListener('click', () => {
        if (item.product_url) bridge.openLink(item.product_url);
        else bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    ctaRow.appendChild(btn);
  });
  container.appendChild(ctaRow);

  // Shared "Change Comparison" CTA row
  const changeRow = document.createElement('div');
  changeRow.className = 'csp-change-row';
  const changeSpacer = document.createElement('div');
  changeSpacer.className = 'csp-cta-spacer';
  changeRow.appendChild(changeSpacer);
  const changeBtn = document.createElement('button');
  changeBtn.className = 'csp-cta csp-cta-secondary';
  changeBtn.type = 'button';
  changeBtn.textContent = 'Change Comparison';
  if (bridge) {
    changeBtn.addEventListener('click', () => bridge.sendMessage('Change the comparison'));
  }
  changeRow.appendChild(changeBtn);
  container.appendChild(changeRow);

  block.appendChild(container);
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
      // structuredContent.products — bare array outputSchema; key derived from actionName "compare_sports_products"
      items = structuredContent?.products || [];
    }
    renderComparison(block, items, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    items = SAMPLE_DATA;
    renderComparison(block, items, bridge);
  }
}
