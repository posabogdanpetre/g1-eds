// codegen:layout-pattern=booking-form
// Sample data for standalone/preview mode. In production, the appointment result
// comes dynamically from bridge.toolResult (a single flat object).
const SAMPLE_VEHICLE = {
  vehicle_id: 'palisade-hybrid',
  name: 'Palisade Hybrid',
  model_year: 2027,
  category: 'Midsize Three-Row SUV',
  powertrain: 'Hybrid',
  detail_url: 'https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid',
  image_url: '',
};

const SAMPLE_DEALER = {
  dealer_name: 'Hyundai of Downtown',
  dealer_address: '1420 Auto Center Dr, Springfield, IL 62704',
  dealer_phone: '(217) 555-0142',
};

// Sample confirmed appointment (shown only if preview is toggled to result view).
const SAMPLE_RESULT = {
  confirmation_id: 'TD-2026-4821',
  status: 'Confirmed',
  message: 'Your test drive is confirmed. Please bring a valid driver’s license.',
  vehicle_name: '2027 Palisade Hybrid',
  dealer_name: 'Hyundai of Downtown',
  dealer_address: '1420 Auto Center Dr, Springfield, IL 62704',
  dealer_phone: '(217) 555-0142',
  appointment_date: '2026-09-05',
  appointment_time: 'Saturday morning (9:00–11:00 AM)',
  calendar_url: 'https://www.hyundaiusa.com/us/en/dealer-locator',
  directions_url: 'https://www.hyundaiusa.com/us/en/dealer-locator',
};

// Brand palette from DESIGN_TOKENS' color tier (Meridian Steel — Hyundai navy/azure).
const PALETTE = ['#002c5e', '#2486d3', '#333333'];
const ACCENT = '#002c5e';
const SECONDARY = '#2486d3';
const CARD_COLORS = ['#002c5e', '#2486d3', '#0fb5ae', '#e68619', '#d83790', '#2dca72'];

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
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let result = null;
  let isPreview = false;

  if (bridge) {
    bridge.applyHostStyles();
    isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // Detail/result concept — structuredContent IS the appointment object (flat).
      const _result = await bridge.toolResult;
      result = _result?.structuredContent || {};
    }
  }

  block.textContent = '';
  if (result && result.confirmation_id) {
    renderConfirmation(block, result, bridge);
  } else {
    renderForm(block, SAMPLE_VEHICLE, SAMPLE_DEALER, bridge);
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

function makeVehicleThumb(vehicle) {
  const thumb = document.createElement('div');
  thumb.className = 'sd-thumb';
  if (vehicle.image_url) {
    const img = document.createElement('img');
    img.src = vehicle.image_url;
    img.alt = vehicle.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    thumb.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    thumb.appendChild(d);
  }
  return thumb;
}

function renderForm(block, vehicle, dealer, bridge) {
  const card = document.createElement('div');
  card.className = 'sd-card';

  // Header (navy) with compact vehicle summary.
  const header = document.createElement('div');
  header.className = 'sd-header';
  header.style.cssText = `background:${theme?.bg ?? ACCENT};color:${theme?.fg ?? '#fff'};`;

  header.appendChild(makeVehicleThumb(vehicle));

  const vinfo = document.createElement('div');
  vinfo.className = 'sd-vinfo';
  const vtitle = document.createElement('div');
  vtitle.className = 'sd-vtitle';
  vtitle.textContent = `${vehicle.model_year} ${vehicle.name}`;
  const vsub = document.createElement('div');
  vsub.className = 'sd-vsub';
  vsub.textContent = [vehicle.category, vehicle.powertrain].filter(Boolean).join(' · ');
  const vdealer = document.createElement('div');
  vdealer.className = 'sd-vdealer';
  vdealer.textContent = dealer.dealer_name;
  vinfo.append(vtitle, vsub, vdealer);
  header.appendChild(vinfo);
  card.appendChild(header);

  // Form body.
  const form = document.createElement('form');
  form.className = 'sd-form';
  form.setAttribute('novalidate', '');

  const fields = document.createElement('div');
  fields.className = 'sd-fields';

  const dateField = buildField('Preferred date', 'date', 'sd-date', { type: 'date', value: '2026-09-05' });
  const timeField = buildField('Time window', 'select', 'sd-time', {
    options: ['Saturday morning (9:00–11:00 AM)', 'Saturday afternoon (12:00–3:00 PM)', 'Weekday evening (5:00–7:00 PM)'],
  });
  const nameField = buildField('Full name', 'text', 'sd-name', { placeholder: 'First and last name' });
  const emailField = buildField('Email', 'email', 'sd-email', { placeholder: 'you@example.com' });

  fields.append(dateField.wrap, timeField.wrap, nameField.wrap, emailField.wrap);
  form.appendChild(fields);

  // Consent summary.
  const consent = document.createElement('p');
  consent.className = 'sd-consent';
  consent.textContent = 'By requesting, you agree the dealer may contact you by phone or email to confirm availability. Vehicle and at-home options vary by dealer.';
  form.appendChild(consent);

  // Submit CTA.
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'sd-submit';
  submit.textContent = 'Request Test Drive';
  submit.style.cssText = `background:${ACCENT};`;
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bridge) return;
    const msg = `Schedule my test drive for the ${vehicle.model_year} ${vehicle.name} at ${dealer.dealer_name} on ${dateField.input.value || 'my preferred date'}, ${timeField.input.value}. Name: ${nameField.input.value || '(pending)'}, email: ${emailField.input.value || '(pending)'}.`;
    bridge.sendMessage(msg);
  });

  card.appendChild(form);
  block.appendChild(card);
}

function buildField(labelText, kind, cls, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'sd-field';
  const label = document.createElement('label');
  label.className = 'sd-label';
  label.textContent = labelText;
  wrap.appendChild(label);

  let input;
  if (kind === 'select') {
    input = document.createElement('select');
    (opts.options || []).forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      input.appendChild(opt);
    });
  } else {
    input = document.createElement('input');
    input.type = opts.type || 'text';
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.value) input.value = opts.value;
  }
  input.className = `sd-input ${cls}`;
  const id = `sd-${cls}`;
  input.id = id;
  label.setAttribute('for', id);
  wrap.appendChild(input);
  return { wrap, input };
}

function renderConfirmation(block, result, bridge) {
  const card = document.createElement('div');
  card.className = 'sd-card sd-card-result';

  const header = document.createElement('div');
  header.className = 'sd-header sd-header-result';
  header.style.cssText = `background:${theme?.bg ?? ACCENT};color:${theme?.fg ?? '#fff'};`;

  const statusRaw = (result.status || '').toLowerCase();
  const confirmed = statusRaw.includes('confirm') && !statusRaw.includes('pending') && !statusRaw.includes('unable');
  const badge = document.createElement('span');
  badge.className = `sd-badge ${confirmed ? 'sd-badge-ok' : 'sd-badge-pending'}`;
  badge.textContent = confirmed ? 'Confirmed' : 'Request sent — dealer follow-up required';
  header.appendChild(badge);

  const vt = document.createElement('div');
  vt.className = 'sd-vtitle';
  vt.textContent = result.vehicle_name || 'Test drive';
  header.appendChild(vt);

  if (result.confirmation_id) {
    const conf = document.createElement('div');
    conf.className = 'sd-confid';
    conf.textContent = `Confirmation #${result.confirmation_id}`;
    header.appendChild(conf);
  }
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'sd-result-body';

  const addRow = (label, value) => {
    if (!value) return;
    const row = document.createElement('div');
    row.className = 'sd-row';
    const l = document.createElement('span');
    l.className = 'sd-row-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'sd-row-value';
    v.textContent = value;
    row.append(l, v);
    body.appendChild(row);
  };

  const when = [result.appointment_date, result.appointment_time].filter(Boolean).join(' · ');
  addRow('When', when);
  addRow('Dealer', result.dealer_name);
  addRow('Address', result.dealer_address);
  addRow('Phone', result.dealer_phone);
  card.appendChild(body);

  // CTAs.
  const ctas = document.createElement('div');
  ctas.className = 'sd-ctas';

  const makeBtn = (text, primary, url) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `sd-cta ${primary ? 'sd-cta-primary' : 'sd-cta-secondary'}`;
    b.textContent = text;
    if (primary) b.style.cssText = `background:${ACCENT};`;
    b.addEventListener('click', () => {
      if (!bridge) return;
      if (url) bridge.openLink(url);
      else bridge.sendMessage(`Tell me more about my ${result.vehicle_name || 'test drive'} appointment.`);
    });
    return b;
  };

  ctas.appendChild(makeBtn('Add to Calendar', true, result.calendar_url));
  ctas.appendChild(makeBtn('Get Directions', false, result.directions_url));
  card.appendChild(ctas);

  const vehicleBtn = makeBtn('View Vehicle Details', false, result.vehicle_url || result.detail_url);
  vehicleBtn.classList.add('sd-cta-full');
  card.appendChild(vehicleBtn);

  block.appendChild(card);
}
