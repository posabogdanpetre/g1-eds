// codegen:layout-pattern=booking-form
// Booking-form widget for request_equipment_service.
// Standalone/preview mode uses SAMPLE_CONFIRMATION so the card renders a meaningful
// confirmation state. In production, data comes from bridge.toolResult (a single flat
// confirmation object — outputSchema is one object, not an array).

const SAMPLE_CONFIRMATION = {
  confirmation_id: 'SG-SVC-40817',
  status: 'pending confirmation',
  message: 'Thanks! The Cluj-Napoca service center has received your request and will confirm your Saturday morning drop-off by phone.',
  location_name: 'SportGuru Cluj-Napoca',
  requested_slot: 'Sat 6 Sep 2026, morning',
  service_type: 'Bicycle repair',
  contact_method: 'Phone',
  assessment_required: true,
};

const FORM_FIELDS = [
  { key: 'service_type', label: 'Service type', placeholder: 'e.g. Bicycle repair', required: true },
  { key: 'equipment_summary', label: 'Equipment', placeholder: 'Brand, model, condition', required: true },
  { key: 'reported_issue', label: 'Reported issue', placeholder: 'Describe the problem', required: true },
  { key: 'preferred_location', label: 'Preferred location', placeholder: 'SportGuru location', required: true },
  { key: 'preferred_date', label: 'Preferred date', placeholder: 'YYYY-MM-DD', required: false },
  { key: 'preferred_time_window', label: 'Time window', placeholder: 'e.g. Morning', required: false },
  { key: 'customer_name', label: 'Your name', placeholder: 'Full name', required: true },
  { key: 'contact_details', label: 'Contact', placeholder: 'Phone or email', required: true },
];

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      confirmation = SAMPLE_CONFIRMATION;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      confirmation = structuredContent.confirmation_id ? structuredContent : null;
    }
  } else {
    confirmation = SAMPLE_CONFIRMATION;
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

function makeCard() {
  const card = document.createElement('div');
  card.className = 'request-equipment-service-card';
  return card;
}

function makeHeader(title, subtitle) {
  const header = document.createElement('div');
  header.className = 'request-equipment-service-header';
  const h = document.createElement('div');
  h.className = 'request-equipment-service-title';
  h.textContent = title;
  header.appendChild(h);
  if (subtitle) {
    const p = document.createElement('div');
    p.className = 'request-equipment-service-subtitle';
    p.textContent = subtitle;
    header.appendChild(p);
  }
  return header;
}

function renderForm(block, bridge) {
  const card = makeCard();
  card.appendChild(makeHeader('Book a Service Appointment', 'Tell us about your equipment and preferred time. We’ll confirm availability.'));

  const body = document.createElement('div');
  body.className = 'request-equipment-service-body';

  const form = document.createElement('form');
  form.className = 'request-equipment-service-form';
  const inputs = {};

  FORM_FIELDS.forEach((f) => {
    const wrap = document.createElement('label');
    wrap.className = 'request-equipment-service-field';
    const lab = document.createElement('span');
    lab.className = 'request-equipment-service-label';
    lab.textContent = f.label;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = f.placeholder;
    input.name = f.key;
    if (f.required) input.required = true;
    inputs[f.key] = input;
    wrap.appendChild(lab);
    wrap.appendChild(input);
    form.appendChild(wrap);
  });

  const notice = document.createElement('p');
  notice.className = 'request-equipment-service-notice';
  notice.textContent = 'Price, repair scope, and timing may require an in-person assessment.';
  form.appendChild(notice);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'request-equipment-service-cta';
  submit.textContent = 'Submit Service Request';
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bridge) return;
    const parts = FORM_FIELDS
      .map((f) => (inputs[f.key].value.trim() ? `${f.label}: ${inputs[f.key].value.trim()}` : null))
      .filter(Boolean);
    bridge.sendMessage(`Submit a service appointment request. ${parts.join('. ')}.`);
  });

  body.appendChild(form);
  card.appendChild(body);
  block.appendChild(card);
}

function renderConfirmation(block, c, bridge) {
  const card = makeCard();
  card.appendChild(makeHeader('Service Request Submitted', c.message || 'Your request has been received.'));

  const body = document.createElement('div');
  body.className = 'request-equipment-service-body';

  const statusRow = document.createElement('div');
  statusRow.className = 'request-equipment-service-statusrow';
  const idText = document.createElement('span');
  idText.className = 'request-equipment-service-confid';
  idText.textContent = c.confirmation_id ? `#${c.confirmation_id}` : '';
  statusRow.appendChild(idText);
  if (c.status) {
    const chip = document.createElement('span');
    chip.className = 'request-equipment-service-chip';
    chip.textContent = c.status;
    statusRow.appendChild(chip);
  }
  body.appendChild(statusRow);

  const details = document.createElement('dl');
  details.className = 'request-equipment-service-details';
  const rows = [
    ['Location', c.location_name],
    ['Requested', c.requested_slot],
    ['Service', c.service_type],
    ['Follow-up', c.contact_method],
  ];
  rows.forEach(([label, value]) => {
    if (!value) return;
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    details.appendChild(dt);
    details.appendChild(dd);
  });
  body.appendChild(details);

  if (c.assessment_required) {
    const notice = document.createElement('p');
    notice.className = 'request-equipment-service-notice';
    notice.textContent = 'Price, repair scope, and timing may require an in-person assessment.';
    body.appendChild(notice);
  }

  const actions = document.createElement('div');
  actions.className = 'request-equipment-service-actions';

  const viewBtn = document.createElement('button');
  viewBtn.type = 'button';
  viewBtn.className = 'request-equipment-service-secondary';
  viewBtn.textContent = 'View Location';
  if (bridge) {
    viewBtn.addEventListener('click', () => {
      bridge.sendMessage(`Show me details for ${c.location_name || 'the SportGuru service location'}.`);
    });
  }
  actions.appendChild(viewBtn);

  const contactBtn = document.createElement('button');
  contactBtn.type = 'button';
  contactBtn.className = 'request-equipment-service-secondary';
  contactBtn.textContent = 'Contact Service Center';
  if (bridge) {
    contactBtn.addEventListener('click', () => {
      bridge.sendMessage(`How can I contact the ${c.location_name || 'SportGuru'} service center?`);
    });
  }
  actions.appendChild(contactBtn);

  body.appendChild(actions);
  card.appendChild(body);
  block.appendChild(card);
}
