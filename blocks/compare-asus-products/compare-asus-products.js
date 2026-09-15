// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'ASUS Zenbook A16 (UX3607)',
    description: 'Ultra-lightweight 16-inch 3K OLED Copilot+ laptop with Snapdragon X2 Elite Extreme and 21+ hours of battery life.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/c5590f5d-0618-41e1-8f79-d8746a3e7301/',
    price: '$1,799.99',
    category: 'Laptop',
    series: 'Zenbook',
    availability: 'In stock',
  },
  {
    name: 'ASUS Vivobook S16 (S5608, Qualcomm)',
    description: '16-inch portable Copilot+ laptop powered by Snapdragon X with an ASUS OLED display and 25+ hour battery life.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/d83e6089-8343-4639-803e-d3c3df3e058b/',
    category: 'Laptop',
    series: 'Vivobook',
    availability: 'In stock',
  },
];

const ACCENT = '#006ce1';

function prettifyLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCompareValue(v) {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function buildHeaderPanel(item) {
  const panel = document.createElement('div');
  panel.className = 'compare-asus-products-header-panel';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'compare-asus-products-header-image';
  const imgSrc = item.image_url;
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'compare-asus-products-header-image-placeholder';
      imgWrap.replaceChild(d, img);
    };
    imgWrap.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.className = 'compare-asus-products-header-image-placeholder';
    imgWrap.appendChild(d);
  }
  panel.appendChild(imgWrap);

  const content = document.createElement('div');
  content.className = 'compare-asus-products-header-content';

  const title = document.createElement('h3');
  title.className = 'compare-asus-products-header-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  const modelBits = [item.model_number, item.series].filter(Boolean).join(' · ');
  if (modelBits) {
    const chip = document.createElement('span');
    chip.className = 'compare-asus-products-header-chip';
    chip.textContent = modelBits;
    content.appendChild(chip);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'compare-asus-products-header-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  panel.appendChild(content);
  return panel;
}

function buildRowSpacer() {
  const spacer = document.createElement('div');
  spacer.className = 'compare-asus-products-row-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  return spacer;
}

function renderComparison(block, items, bridge) {
  const itemA = items[0] || {};
  const itemB = items[1] || items[0] || {};

  const card = document.createElement('div');
  card.className = 'compare-asus-products-card';

  const headerRow = document.createElement('div');
  headerRow.className = 'compare-asus-products-header-row';
  headerRow.appendChild(buildRowSpacer());
  headerRow.appendChild(buildHeaderPanel(itemA));
  headerRow.appendChild(buildHeaderPanel(itemB));
  card.appendChild(headerRow);

  // Attribute table: every comparable field the header panels didn't already
  // render. Fields shown in the header (name/model/series/image/description/URLs)
  // are excluded so nothing appears twice.
  const usedKeys = {};
  const HEADER_KEYS = ['name', 'model_number', 'series', 'image_url', 'description'];
  HEADER_KEYS.forEach((k) => { usedKeys[k] = true; });

  const rows = [];
  function addRow(key, label, lead) {
    if (!key || usedKeys[key]) return;
    const a = itemA[key];
    const b = itemB[key];
    if (a === undefined && b === undefined) return;
    usedKeys[key] = true;
    rows.push({ label, a, b, lead: !!lead });
  }

  addRow('price', 'Price', true);
  addRow('availability', 'Availability', true);
  addRow('best_for', 'Best For');
  addRow('advantages', 'Advantages');
  addRow('tradeoffs', 'Tradeoffs');
  addRow('shared_features', 'Shared');
  addRow('category', 'Category');

  const SKIP_KEY_RE = /(^id$|_id$|url$|^image|^currency$)/i;
  const allKeys = Object.keys(itemA).concat(
    Object.keys(itemB).filter((k) => !(k in itemA)),
  );
  allKeys.forEach((key) => {
    if (usedKeys[key] || SKIP_KEY_RE.test(key)) return;
    const v = itemA[key] !== undefined ? itemA[key] : itemB[key];
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) return;
    if (typeof v === 'string' && v.length > 60) return;
    addRow(key, prettifyLabel(key), false);
  });

  const table = document.createElement('div');
  table.className = 'compare-asus-products-table';

  rows.slice(0, 6).forEach((row) => {
    const tr = document.createElement('div');
    tr.className = `compare-asus-products-table-row${row.lead ? ' compare-asus-products-table-row-lead' : ''}`;

    const label = document.createElement('div');
    label.className = 'compare-asus-products-table-label';
    label.textContent = row.label;
    tr.appendChild(label);

    const da = formatCompareValue(row.a);
    const db = formatCompareValue(row.b);
    const differs = da !== db;
    [da, db].forEach((text) => {
      const val = document.createElement('div');
      val.className = `compare-asus-products-table-value${differs ? ' compare-asus-products-table-value-diff' : ''}`;
      val.textContent = text;
      tr.appendChild(val);
    });

    table.appendChild(tr);
  });

  card.appendChild(table);

  // Per-item "View Product" CTA row.
  const ctaRow = document.createElement('div');
  ctaRow.className = 'compare-asus-products-table-row compare-asus-products-cta-row';
  ctaRow.appendChild(buildRowSpacer());
  [itemA, itemB].forEach((item) => {
    const cta = document.createElement('button');
    cta.className = 'compare-asus-products-table-cta';
    cta.type = 'button';
    cta.textContent = 'View Product';
    if (bridge) {
      cta.addEventListener('click', () => {
        const url = item.product_url || item.purchase_url;
        if (url) {
          bridge.openLink(url);
        } else {
          bridge.sendMessage(`Tell me more about the ${item.name || 'product'}.`);
        }
      });
    }
    ctaRow.appendChild(cta);
  });
  card.appendChild(ctaRow);

  // Shared CTAs: "Where to Buy" + "Find Another Match", inset to span the same
  // left/right edges as the two per-item buttons combined.
  const sharedRow = document.createElement('div');
  sharedRow.className = 'compare-asus-products-table-row compare-asus-products-shared-cta-row';
  sharedRow.appendChild(buildRowSpacer());

  const whereToBuy = document.createElement('button');
  whereToBuy.className = 'compare-asus-products-shared-cta';
  whereToBuy.type = 'button';
  whereToBuy.textContent = 'Where to Buy';
  if (bridge) {
    whereToBuy.addEventListener('click', () => {
      const url = itemA.purchase_url || itemB.purchase_url || itemA.product_url || itemB.product_url;
      if (url) {
        bridge.openLink(url);
      } else {
        bridge.sendMessage('Where can I buy these ASUS products?');
      }
    });
  }
  sharedRow.appendChild(whereToBuy);

  const findAnother = document.createElement('button');
  findAnother.className = 'compare-asus-products-shared-cta compare-asus-products-shared-cta-secondary';
  findAnother.type = 'button';
  findAnother.textContent = 'Find Another Match';
  if (bridge) {
    findAnother.addEventListener('click', () => {
      bridge.sendMessage('Help me find another ASUS product to compare.');
    });
  }
  sharedRow.appendChild(findAnother);

  card.appendChild(sharedRow);

  block.appendChild(card);
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
      // structuredContent.products — derived from action name "compare_asus_products"
      // (bare array outputSchema rule)
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';
  renderComparison(block, items, bridge);

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
