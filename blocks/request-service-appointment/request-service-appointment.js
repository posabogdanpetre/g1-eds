// Sample data for standalone/preview mode.
// In production, the confirmation comes dynamically from bridge.toolResult.
const SAMPLE_CONFIRMATION = {
  confirmation_id: 'SG-SVC-2026-04821',
  status: 'Pending confirmation',
  message: 'Your service request has been received. A SportGuru technician will review it and confirm availability.',
  service_type: 'Bicycle service',
  requested_location: 'SportGuru Cluj-Napoca',
  requested_date: '2026-08-22',
  requested_time_window: 'Morning',
  next_step: 'Our store team will contact you within 24 hours to confirm your appointment slot.',
};

const SERVICE_OPTIONS = [
  { value: 'Bicycle service', label: 'Bicycle service', note: 'Bring your bike ready to ride. Note any recent squeaks, shifting or braking issues so the technician can prioritise checks.' },
  { value: 'Ski service', label: 'Ski service', note: 'Remove any old wax or stickers. Let us know your binding DIN preference if you have one.' },
  { value: 'Snowboard service', label: 'Snowboard service', note: 'Detach leashes and note any edge or base damage you have spotted.' },
  { value: 'Tennis service', label: 'Tennis service', note: 'Bring the racquet and specify preferred string type and tension if known.' },
];

const TIME_WINDOWS = ['Morning', 'Midday', 'Afternoon', 'Evening'];

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
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#6100A2';

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      confirmation = null; // preview shows the form
    } else {
      // Booking-form / confirmation concept — structuredContent IS the flat result object.
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      confirmation = structuredContent?.confirmation_id ? structuredContent : null;
    }
  }

  block.textContent = '';
  if (confirmation) {
    renderConfirmation(block, confirmation, bridge);
  } else {
    renderForm(block, bridge);
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

function field(labelText, controlEl) {
  const wrap = document.createElement('div');
  wrap.className = 'rsa-field';
  const label = document.createElement('label');
  label.className = 'rsa-label';
  label.textContent = labelText;
  wrap.appendChild(label);
  wrap.appendChild(controlEl);
  return wrap;
}

function renderForm(block, bridge) {
  const card = document.createElement('div');
  card.className = 'rsa-card';

  const header = document.createElement('div');
  header.className = 'rsa-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'rsa-title';
  title.textContent = 'Request a Service Appointment';
  const sub = document.createElement('p');
  sub.className = 'rsa-sub';
  sub.textContent = 'Tell us about your equipment and preferred time. This is a request — our store team confirms availability before it is booked.';
  header.appendChild(title);
  header.appendChild(sub);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'rsa-body';

  const serviceSelect = document.createElement('select');
  serviceSelect.className = 'rsa-input';
  SERVICE_OPTIONS.forEach((o) => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    serviceSelect.appendChild(opt);
  });
  body.appendChild(field('Service type', serviceSelect));

  const note = document.createElement('div');
  note.className = 'rsa-note';
  const setNote = () => {
    const found = SERVICE_OPTIONS.find((o) => o.value === serviceSelect.value) || SERVICE_OPTIONS[0];
    note.textContent = found.note;
  };
  setNote();
  serviceSelect.addEventListener('change', setNote);
  body.appendChild(note);

  const equip = document.createElement('textarea');
  equip.className = 'rsa-input rsa-textarea';
  equip.rows = 2;
  equip.placeholder = 'Model, condition and the issue (e.g. Cube Touring One, squeaking and poor shifting)';
  body.appendChild(field('Equipment & issue', equip));

  const location = document.createElement('input');
  location.type = 'text';
  location.className = 'rsa-input';
  location.placeholder = 'e.g. SportGuru Cluj-Napoca';
  body.appendChild(field('Preferred location', location));

  const dateTimeRow = document.createElement('div');
  dateTimeRow.className = 'rsa-row';
  const date = document.createElement('input');
  date.type = 'date';
  date.className = 'rsa-input';
  const timeWindow = document.createElement('select');
  timeWindow.className = 'rsa-input';
  TIME_WINDOWS.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    timeWindow.appendChild(opt);
  });
  dateTimeRow.appendChild(field('Preferred date', date));
  dateTimeRow.appendChild(field('Time window', timeWindow));
  body.appendChild(dateTimeRow);

  const contactRow = document.createElement('div');
  contactRow.className = 'rsa-row';
  const name = document.createElement('input');
  name.type = 'text';
  name.className = 'rsa-input';
  name.placeholder = 'Your name';
  const contact = document.createElement('input');
  contact.type = 'text';
  contact.className = 'rsa-input';
  contact.placeholder = 'Phone or email';
  contactRow.appendChild(field('Contact name', name));
  contactRow.appendChild(field('Contact method', contact));
  body.appendChild(contactRow);

  const submit = document.createElement('button');
  submit.className = 'rsa-submit';
  submit.type = 'button';
  submit.textContent = 'Submit Service Request';
  submit.addEventListener('click', () => {
    if (bridge) {
      const parts = [
        `Request a ${serviceSelect.value}`,
        equip.value ? `for ${equip.value}` : '',
        location.value ? `at ${location.value}` : '',
        date.value ? `on ${date.value}` : '',
        timeWindow.value ? `(${timeWindow.value})` : '',
        name.value ? `Name: ${name.value}` : '',
        contact.value ? `Contact: ${contact.value}` : '',
      ].filter(Boolean);
      bridge.sendMessage(parts.join(', ') + '.');
    }
  });
  body.appendChild(submit);

  card.appendChild(body);
  block.appendChild(card);
}

function renderConfirmation(block, c, bridge) {
  const card = document.createElement('div');
  card.className = 'rsa-card';

  const header = document.createElement('div');
  header.className = 'rsa-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const badge = document.createElement('span');
  badge.className = 'rsa-badge';
  badge.textContent = c.status || 'Submitted';
  header.appendChild(badge);

  const title = document.createElement('h3');
  title.className = 'rsa-title';
  title.textContent = 'Service Request Received';
  header.appendChild(title);

  if (c.confirmation_id) {
    const idLine = document.createElement('p');
    idLine.className = 'rsa-sub';
    idLine.textContent = `Reference: ${c.confirmation_id}`;
    header.appendChild(idLine);
  }
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'rsa-body';

  const rows = [
    ['Service', c.service_type],
    ['Location', c.requested_location],
    ['Date', c.requested_date],
    ['Time window', c.requested_time_window],
  ];
  rows.forEach(([k, v]) => {
    if (!v) return;
    const row = document.createElement('div');
    row.className = 'rsa-detail';
    const key = document.createElement('span');
    key.className = 'rsa-detail-key';
    key.textContent = k;
    const val = document.createElement('span');
    val.className = 'rsa-detail-val';
    val.textContent = v;
    row.appendChild(key);
    row.appendChild(val);
    body.appendChild(row);
  });

  if (c.message) {
    const msg = document.createElement('p');
    msg.className = 'rsa-message';
    msg.textContent = c.message;
    body.appendChild(msg);
  }

  const narrative = document.createElement('p');
  narrative.className = 'rsa-narrative';
  narrative.textContent = c.next_step || 'This is a request only — staff confirmation is still required before your appointment is finalised.';
  body.appendChild(narrative);

  const ctaRow = document.createElement('div');
  ctaRow.className = 'rsa-cta-row';

  const details = document.createElement('button');
  details.type = 'button';
  details.className = 'rsa-submit';
  details.textContent = 'View Request Details';
  details.addEventListener('click', () => {
    if (bridge) bridge.sendMessage(`Show me the details for service request ${c.confirmation_id || ''}`.trim());
  });
  ctaRow.appendChild(details);

  const directions = document.createElement('button');
  directions.type = 'button';
  directions.className = 'rsa-secondary';
  directions.textContent = 'Get Directions';
  directions.addEventListener('click', () => {
    if (bridge) bridge.sendMessage(`How do I get to ${c.requested_location || 'the SportGuru store'}?`);
  });
  ctaRow.appendChild(directions);

  body.appendChild(ctaRow);
  card.appendChild(body);
  block.appendChild(card);
}
