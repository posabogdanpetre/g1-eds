// codegen:layout-pattern=generic-detail
// Sample data for standalone/preview mode. In production, data comes from bridge.toolResult.
// This is a detail/single-object concept — structuredContent IS the estimate (flat).
const SAMPLE_DATA = {
  payment_type: 'finance',
  estimated_monthly_payment: 698,
  vehicle_price: 44560,
  down_payment: 3000,
  trade_in_value: 8000,
  term_months: 60,
  estimated_rate_or_factor: '6.49% APR',
  due_at_signing: 3000,
  estimated_taxes_and_fees: 2100,
  total_estimated_cost: 41880,
  assumptions: [
    'Good credit tier (approx. 720+)',
    'ZIP 30303 regional tax estimate',
    'Excludes title, registration, and dealer add-ons',
  ],
  disclaimer:
    'This is an estimate for informational purposes only and is not an offer of credit, a financing approval, or a guaranteed dealer price. Taxes, fees, rates, and final terms may vary.',
};

// Brand colors from DESIGN_TOKENS (Meridian Steel — Hyundai): navy accent, azure secondary.
const PALETTE = ['#002c5e', '#2486d3', '#333333'];
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
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const usd = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

function parseRate(str, fallback) {
  if (typeof str === 'number') return str;
  const m = String(str || '').match(/([\d.]+)\s*%/);
  return m ? parseFloat(m[1]) : fallback;
}

function computeFinance(s) {
  const principal = Math.max((s.price + s.taxesFees) - s.down - s.trade, 0);
  const r = s.apr / 1200;
  const monthly = r > 0 ? (principal * r) / (1 - (1 + r) ** -s.term) : principal / s.term;
  return {
    payment_type: 'Finance',
    monthly,
    rate: `${s.apr.toFixed(2)}% APR`,
    dueAtSigning: s.down,
    total: monthly * s.term,
    principal,
  };
}

function computeLease(s) {
  const residualPct = 0.57;
  const residual = s.price * residualPct;
  const capCost = Math.max((s.price + s.taxesFees) - s.down - s.trade, 0);
  const moneyFactor = s.apr / 2400;
  const depreciation = (capCost - residual) / s.term;
  const financeCharge = (capCost + residual) * moneyFactor;
  const monthly = Math.max(depreciation + financeCharge, 0);
  const dueAtSigning = s.down + monthly;
  return {
    payment_type: 'Lease',
    monthly,
    rate: `${(moneyFactor).toFixed(5)} money factor`,
    dueAtSigning,
    total: (monthly * s.term) + dueAtSigning,
    principal: capCost,
  };
}

function renderEstimate(block, item, bridge) {
  const fg = theme?.fg ?? '#fff';
  const bg = theme?.bg ?? '#002c5e';

  const state = {
    mode: (item.payment_type || 'finance').toLowerCase().includes('lease') ? 'lease' : 'finance',
    price: Number(item.vehicle_price) || 44560,
    down: Number(item.down_payment) || 0,
    trade: Number(item.trade_in_value) || 0,
    term: Number(item.term_months) || 60,
    taxesFees: Number(item.estimated_taxes_and_fees) || 0,
    apr: parseRate(item.estimated_rate_or_factor, 6.49),
  };

  const card = document.createElement('div');
  card.className = 'ehp-card';
  card.style.cssText = `background:${bg};color:${fg};`;

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'ehp-tabs';
  tabs.setAttribute('role', 'tablist');
  ['finance', 'lease'].forEach((mode) => {
    const t = document.createElement('button');
    t.className = 'ehp-tab';
    t.type = 'button';
    t.setAttribute('role', 'tab');
    t.textContent = mode === 'finance' ? 'Finance' : 'Lease';
    t.dataset.mode = mode;
    t.addEventListener('click', () => { state.mode = mode; update(); });
    tabs.appendChild(t);
  });
  card.appendChild(tabs);

  // Hero payment
  const hero = document.createElement('div');
  hero.className = 'ehp-hero';
  const amount = document.createElement('span');
  amount.className = 'ehp-amount';
  const per = document.createElement('span');
  per.className = 'ehp-per';
  per.textContent = '/mo';
  const heroTop = document.createElement('div');
  heroTop.className = 'ehp-hero-top';
  heroTop.append(amount, per);
  const heroSub = document.createElement('div');
  heroSub.className = 'ehp-hero-sub';
  hero.append(heroTop, heroSub);
  card.appendChild(hero);

  // Breakdown grid
  const grid = document.createElement('dl');
  grid.className = 'ehp-grid';
  card.appendChild(grid);

  // Controls (sliders)
  const controls = document.createElement('div');
  controls.className = 'ehp-controls';

  function slider(labelText, min, max, step, getVal, setVal, fmt) {
    const wrap = document.createElement('div');
    wrap.className = 'ehp-slider';
    const row = document.createElement('div');
    row.className = 'ehp-slider-row';
    const lbl = document.createElement('span');
    lbl.className = 'ehp-slider-label';
    lbl.textContent = labelText;
    const val = document.createElement('span');
    val.className = 'ehp-slider-val';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min; input.max = max; input.step = step;
    input.setAttribute('aria-label', labelText);
    input.addEventListener('input', () => { setVal(Number(input.value)); update(); });
    row.append(lbl, val);
    wrap.append(row, input);
    controls.appendChild(wrap);
    return { input, val, getVal, fmt };
  }

  const downSlider = slider('Down Payment', 0, Math.round(state.price), 250,
    () => state.down, (v) => { state.down = v; }, usd);
  const termSlider = slider('Term', 24, 84, 12,
    () => state.term, (v) => { state.term = v; }, (v) => `${v} mo`);
  card.appendChild(controls);

  // Assumptions chips
  const chips = document.createElement('div');
  chips.className = 'ehp-chips';
  (item.assumptions || []).slice(0, 3).forEach((a) => {
    const chip = document.createElement('span');
    chip.className = 'ehp-chip';
    chip.textContent = String(a);
    chips.appendChild(chip);
  });
  if (chips.childNodes.length) card.appendChild(chips);

  // Short compliance footnote (structured disclaimer field)
  const foot = document.createElement('p');
  foot.className = 'ehp-foot';
  foot.textContent = 'Estimate only — not a financing offer or guaranteed price.';
  card.appendChild(foot);

  // CTAs (max 2)
  const cta = document.createElement('div');
  cta.className = 'ehp-cta';
  const btn1 = document.createElement('button');
  btn1.type = 'button';
  btn1.className = 'ehp-btn ehp-btn-primary';
  btn1.textContent = 'Search Matching Inventory';
  const btn2 = document.createElement('button');
  btn2.type = 'button';
  btn2.className = 'ehp-btn ehp-btn-secondary';
  btn2.textContent = 'Request Dealer Quote';
  if (bridge) {
    btn1.addEventListener('click', () => bridge.sendMessage('Search matching Hyundai inventory for this payment estimate'));
    btn2.addEventListener('click', () => bridge.sendMessage('Request a dealer quote for this Hyundai payment estimate'));
  }
  cta.append(btn1, btn2);
  card.appendChild(cta);

  function row(label, value, lead) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    if (lead) { dt.classList.add('lead'); dd.classList.add('lead'); }
    grid.append(dt, dd);
  }

  function update() {
    const calc = state.mode === 'lease' ? computeLease(state) : computeFinance(state);

    tabs.querySelectorAll('.ehp-tab').forEach((t) => {
      const active = t.dataset.mode === state.mode;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    amount.textContent = usd(calc.monthly);
    heroSub.textContent = `${state.mode === 'lease' ? 'Lease' : 'Finance'} · ${state.term} months · ${calc.rate}`;

    grid.textContent = '';
    row('Vehicle Price', usd(state.price));
    row('Down Payment', usd(state.down));
    if (state.trade) row('Trade-In Credit', `-${usd(state.trade)}`);
    row('Term', `${state.term} months`);
    row(state.mode === 'lease' ? 'Money Factor' : 'Rate', calc.rate);
    if (state.taxesFees) row('Taxes & Fees', usd(state.taxesFees));
    if (state.mode === 'lease') row('Due at Signing', usd(calc.dueAtSigning));
    row('Total Est. Cost', usd(calc.total), true);

    downSlider.input.value = state.down;
    downSlider.val.textContent = usd(state.down);
    termSlider.input.value = state.term;
    termSlider.val.textContent = `${state.term} mo`;
  }

  update();
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the estimate (flat object), no wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!item || typeof item.estimated_monthly_payment === 'undefined') {
    const empty = document.createElement('p');
    empty.className = 'ehp-empty';
    empty.textContent = 'No payment estimate is available yet.';
    block.appendChild(empty);
  } else {
    renderEstimate(block, item, bridge);
  }

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
