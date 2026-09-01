// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode. In production, data comes from bridge.toolResult.
const SAMPLE_DATA = [{"vehicle_id": "palisade-hybrid", "name": "Palisade Hybrid", "model_year": 2027, "category": "Midsize Three-Row SUV", "body_style": "SUV", "powertrain": "Hybrid", "starting_msrp": 44560, "range_or_efficiency": "EPA-estimated 34 MPG combined", "seating_capacity": 8, "key_features": ["Up to 8-passenger seating", "Hybrid efficiency", "Heated front, 2nd and 3rd row seats available"], "detail_url": "https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid"}, {"vehicle_id": "santa-fe-hybrid", "name": "Santa Fe Hybrid", "model_year": 2026, "category": "Midsize SUV", "body_style": "SUV", "powertrain": "Hybrid", "starting_msrp": 36400, "range_or_efficiency": "EPA-estimated 36 MPG combined; 231 combined hp", "seating_capacity": 7, "key_features": ["Three-row seating", "Hybrid efficiency", "AWD available"], "detail_url": "https://www.hyundaiusa.com/us/en/vehicles/santa-fe-hybrid"}];

const CARD_COLORS = ['#002c5e', '#2486d3'];

function formatCompareValue(v) {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'number') return String(v);
  return String(v);
}

function formatPrice(v) {
  if (v === undefined || v === null || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.]/g, ''));
  if (!isNaN(n) && n > 0) return '$' + n.toLocaleString('en-US');
  return String(v);
}

// Build the two header summaries + comparison rows from a pair of raw vehicle
// objects (preview mode / fallback). In production the handler supplies these
// pre-computed as first_product / second_product / comparison_rows.
function normalizeFromVehicles(a, b) {
  a = a || {};
  b = b || {};
  const header = (v) => ({
    name: v.name || '',
    model_year: v.model_year || '',
    image_url: v.image_url || '',
    starting_msrp: v.starting_msrp,
  });
  const rows = [];
  rows.push({ label: 'Price', first: formatPrice(a.starting_msrp), second: formatPrice(b.starting_msrp), lead: true });
  rows.push({ label: 'Seating', first: formatCompareValue(a.seating_capacity), second: formatCompareValue(b.seating_capacity) });
  rows.push({ label: 'Powertrain', first: formatCompareValue(a.powertrain), second: formatCompareValue(b.powertrain) });
  rows.push({ label: 'Efficiency', first: formatCompareValue(a.range_or_efficiency), second: formatCompareValue(b.range_or_efficiency) });
  rows.push({ label: 'Category', first: formatCompareValue(a.category), second: formatCompareValue(b.category) });
  rows.push({ label: 'Features', first: formatCompareValue(a.key_features), second: formatCompareValue(b.key_features) });
  return { first: header(a), second: header(b), rows: rows };
}

// Normalize the handler's structured comparison result into the same shape.
function normalizeFromResult(sc) {
  const fp = sc.first_product || {};
  const sp = sc.second_product || {};
  const rowsIn = Array.isArray(sc.comparison_rows) ? sc.comparison_rows : [];
  const rows = rowsIn.map(function (r) {
    return {
      label: r.label || r.category || '',
      first: formatCompareValue(r.first_value),
      second: formatCompareValue(r.second_value),
      lead: /price|msrp/i.test(r.label || r.category || ''),
    };
  });
  // Ensure price appears as a lead row even if the handler didn't include it.
  const hasPrice = rows.some(function (r) { return /price|msrp/i.test(r.label); });
  if (!hasPrice && (fp.starting_msrp !== undefined || sp.starting_msrp !== undefined)) {
    rows.unshift({ label: 'Price', first: formatPrice(fp.starting_msrp), second: formatPrice(sp.starting_msrp), lead: true });
  }
  return {
    first: { name: fp.name || '', model_year: fp.model_year || '', image_url: fp.image_url || '', starting_msrp: fp.starting_msrp },
    second: { name: sp.name || '', model_year: sp.model_year || '', image_url: sp.image_url || '', starting_msrp: sp.starting_msrp },
    rows: rows,
  };
}

export default async function decorate(block, bridge) {
  let model;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      model = normalizeFromVehicles(SAMPLE_DATA[0], SAMPLE_DATA[1]);
    } else {
      const _result = await bridge.toolResult;
      const sc = _result?.structuredContent || {};
      if (sc.first_product || sc.second_product || sc.comparison_rows) {
        model = normalizeFromResult(sc);
      } else {
        model = normalizeFromVehicles(SAMPLE_DATA[0], SAMPLE_DATA[1]);
      }
    }
  } else {
    model = normalizeFromVehicles(SAMPLE_DATA[0], SAMPLE_DATA[1]);
  }

  renderComparison(block, model, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { bridge.reportSize(block.offsetWidth, block.offsetHeight); }, 150);
    });
    ro.observe(block);
  }
}

function renderComparison(block, model, bridge) {
  block.textContent = '';

  const card = document.createElement('div');
  card.className = 'compare-hyundai-models-card';

  function buildHeaderPanel(product, idx) {
    const panel = document.createElement('div');
    panel.className = 'compare-hyundai-models-header-panel';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'compare-hyundai-models-header-image';
    const fallbackColor = CARD_COLORS[idx % CARD_COLORS.length];
    const colorDiv = function () {
      const d = document.createElement('div');
      d.className = 'compare-hyundai-models-header-image-placeholder';
      d.style.background = fallbackColor;
      return d;
    };
    if (product.image_url) {
      const img = document.createElement('img');
      img.src = product.image_url;
      img.alt = product.name || '';
      img.onerror = function () { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageWrap.appendChild(img);
    } else {
      imageWrap.appendChild(colorDiv());
    }
    panel.appendChild(imageWrap);

    const content = document.createElement('div');
    content.className = 'compare-hyundai-models-header-content';

    if (product.model_year) {
      const chip = document.createElement('span');
      chip.className = 'compare-hyundai-models-header-chip';
      chip.textContent = String(product.model_year);
      content.appendChild(chip);
    }

    const title = document.createElement('h3');
    title.className = 'compare-hyundai-models-header-title';
    title.textContent = product.name || '';
    content.appendChild(title);

    if (product.starting_msrp !== undefined && product.starting_msrp !== null && product.starting_msrp !== '') {
      const year = document.createElement('p');
      year.className = 'compare-hyundai-models-header-year';
      year.textContent = 'Starting at ' + formatPrice(product.starting_msrp);
      content.appendChild(year);
    }

    panel.appendChild(content);
    return panel;
  }

  function buildRowSpacer() {
    const spacer = document.createElement('div');
    spacer.className = 'compare-hyundai-models-row-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    return spacer;
  }

  const headerRow = document.createElement('div');
  headerRow.className = 'compare-hyundai-models-header-row';
  headerRow.appendChild(buildRowSpacer());
  headerRow.appendChild(buildHeaderPanel(model.first, 0));
  headerRow.appendChild(buildHeaderPanel(model.second, 1));
  card.appendChild(headerRow);

  const table = document.createElement('div');
  table.className = 'compare-hyundai-models-table';

  model.rows.slice(0, 6).forEach(function (row) {
    const tr = document.createElement('div');
    tr.className = 'compare-hyundai-models-table-row' + (row.lead ? ' compare-hyundai-models-table-row-lead' : '');

    const label = document.createElement('div');
    label.className = 'compare-hyundai-models-table-label';
    label.textContent = row.label;
    tr.appendChild(label);

    const differs = row.first !== row.second;
    [row.first, row.second].forEach(function (text) {
      const val = document.createElement('div');
      val.className = 'compare-hyundai-models-table-value' + (differs ? ' compare-hyundai-models-table-value-diff' : '');
      val.textContent = text;
      tr.appendChild(val);
    });

    table.appendChild(tr);
  });

  const ctaRow = document.createElement('div');
  ctaRow.className = 'compare-hyundai-models-cta-row compare-hyundai-models-table-row';
  ctaRow.appendChild(buildRowSpacer());
  [model.first, model.second].forEach(function (product) {
    const cta = document.createElement('button');
    cta.className = 'compare-hyundai-models-table-cta';
    cta.textContent = 'View Details';
    if (bridge) {
      cta.addEventListener('click', function () {
        bridge.sendMessage('Tell me more about the ' + (product.name || 'vehicle'));
      });
    }
    ctaRow.appendChild(cta);
  });
  table.appendChild(ctaRow);

  card.appendChild(table);
  block.appendChild(card);
}
