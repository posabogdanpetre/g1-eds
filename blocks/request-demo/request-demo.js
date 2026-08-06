// Sample data for standalone/preview mode.
// In production, the confirmation comes dynamically from bridge.toolResult.
// The list below seeds the "Solution of interest" dropdown from samplePayload.
const SAMPLE_SOLUTIONS = [
  { name: 'V.A.C. Therapy (Negative Pressure Wound Therapy)', category: 'Advanced Wound Care', image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/msd-actwc-vacpnp-photo-home-nurse3-gbl?qlt=85&ts=1785362348351&dpr=off' },
  { name: 'Cavilon Skin Care Solutions', category: 'Advanced Wound Care', image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/med-people-nurse-cavilon-advanced-003-900x450%3AXL--large-desktop?ts=1727100093789&cropN=0,.1,1,1&flip=lr&dpr=off' },
  { name: 'Ioban 2 Antimicrobial Incise Drapes', category: 'Surgical Solutions', image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/ioban-chg-drape-abdomen-app004-ms-ss-en?qlt=85&ts=1775571953007&dpr=off' },
  { name: 'Curos Disinfecting Port Protectors', category: 'IV Site Management', image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/CFF1-270-pkg100?wid=800&hei=600' },
  { name: 'Liqui-Cel EXF Membrane Contactors', category: 'Purification & Filtration', image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/b5005009009_exffamily_Frontside?wid=800&hei=600' },
  { name: 'Fluency for Imaging', category: 'Health Information Technology', image_url: 'https://s7d9.scene7.com/is/image/mmmspinco/ent-abst-rdr-5-rgb-gbl-1?qlt=85&ts=1741706025981&dpr=off' },
];

// Brand palette from the action payload (empty for this action → header uses the
// green gradient from the reference image via CSS).
const PALETTE = [];
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
  for (let i = 0; i < 20; i += 1) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const FIELDS = [
  { key: 'full_name', label: 'Full Name', placeholder: 'Full name of the person requesting the demo.', required: true, type: 'text' },
  { key: 'email', label: 'Email', placeholder: 'Business email address for follow-up.', required: true, type: 'email' },
  { key: 'organization', label: 'Organization', placeholder: "Name of the requester's organization or facility.", required: false, type: 'text' },
  { key: 'solution_of_interest', label: 'Solution of Interest', placeholder: 'Select a solution…', required: true, type: 'select' },
  { key: 'message', label: 'Message', placeholder: 'Optional additional details about the request.', required: false, type: 'textarea' },
];

export default async function decorate(block, bridge) {
  let solutions = SAMPLE_SOLUTIONS;
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // Production — the confirmation comes back from the MCP tool result.
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      if (structuredContent && structuredContent.confirmation_id) {
        confirmation = structuredContent;
      }
    }
  }

  block.textContent = '';
  renderForm(block, solutions, confirmation, bridge);

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

function renderConfirmation(card, confirmation) {
  const conf = document.createElement('div');
  conf.className = 'request-demo-confirmation';

  const check = document.createElement('div');
  check.className = 'request-demo-check';
  check.setAttribute('aria-hidden', 'true');
  check.textContent = '✓';
  conf.appendChild(check);

  const h = document.createElement('h3');
  h.textContent = 'Request received';
  conf.appendChild(h);

  const msg = document.createElement('p');
  msg.className = 'request-demo-conf-msg';
  msg.textContent = confirmation.message || 'Thanks — our team will be in touch shortly to arrange your demo.';
  conf.appendChild(msg);

  if (confirmation.confirmation_id) {
    const idRow = document.createElement('p');
    idRow.className = 'request-demo-conf-id';
    idRow.textContent = `Confirmation ID: ${confirmation.confirmation_id}`;
    conf.appendChild(idRow);
  }

  card.appendChild(conf);
}

function renderForm(block, solutions, confirmation, bridge) {
  const card = document.createElement('div');
  card.className = 'request-demo-card';

  const header = document.createElement('div');
  header.className = 'request-demo-header';
  if (theme) {
    header.style.background = theme.bg;
    header.style.color = theme.fg;
  }

  const title = document.createElement('h2');
  title.className = 'request-demo-title';
  title.textContent = 'Request Demo';
  header.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'request-demo-desc';
  desc.textContent = "Submits a request for a product demonstration or sales consultation, capturing the requester's contact details and solution of interest, and returns a confirmation of the submitted request.";
  header.appendChild(desc);

  card.appendChild(header);

  if (confirmation) {
    renderConfirmation(card, confirmation);
    block.appendChild(card);
    return;
  }

  const form = document.createElement('form');
  form.className = 'request-demo-form';
  form.setAttribute('novalidate', '');

  const controls = {};

  FIELDS.forEach((field) => {
    const wrap = document.createElement('div');
    wrap.className = 'request-demo-field';

    const label = document.createElement('label');
    label.className = 'request-demo-label';
    label.setAttribute('for', `request-demo-${field.key}`);
    label.textContent = field.label;
    if (field.required) {
      const star = document.createElement('span');
      star.className = 'request-demo-required';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = ' *';
      label.appendChild(star);
    }
    wrap.appendChild(label);

    let control;
    if (field.type === 'select') {
      control = document.createElement('select');
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = field.placeholder;
      ph.disabled = true;
      ph.selected = true;
      control.appendChild(ph);
      solutions.forEach((sol) => {
        const opt = document.createElement('option');
        opt.value = sol.name;
        opt.textContent = sol.name;
        control.appendChild(opt);
      });
    } else if (field.type === 'textarea') {
      control = document.createElement('textarea');
      control.rows = 2;
      control.placeholder = field.placeholder;
    } else {
      control = document.createElement('input');
      control.type = field.type;
      control.placeholder = field.placeholder;
    }
    control.id = `request-demo-${field.key}`;
    control.name = field.key;
    control.className = 'request-demo-input';
    if (field.required) control.setAttribute('aria-required', 'true');
    controls[field.key] = control;
    wrap.appendChild(control);

    form.appendChild(wrap);
  });

  const error = document.createElement('p');
  error.className = 'request-demo-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.appendChild(error);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'request-demo-submit';
  submit.textContent = 'Request a Demo';
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = FIELDS.filter((f) => f.required);
    const missing = required.filter((f) => !controls[f.key].value.trim());
    controls && Object.keys(controls).forEach((k) => controls[k].classList.remove('request-demo-invalid'));
    if (missing.length) {
      missing.forEach((f) => controls[f.key].classList.add('request-demo-invalid'));
      error.textContent = `Please complete: ${missing.map((f) => f.label).join(', ')}.`;
      error.hidden = false;
      controls[missing[0].key].focus();
      return;
    }
    error.hidden = true;

    const values = {};
    FIELDS.forEach((f) => { values[f.key] = controls[f.key].value.trim(); });

    if (bridge) {
      const parts = [
        `Please submit a demo request for ${values.full_name} (${values.email})`,
        values.organization ? `at ${values.organization}` : '',
        `interested in ${values.solution_of_interest}`,
      ].filter(Boolean);
      let text = `${parts.join(' ')}.`;
      if (values.message) text += ` Additional details: ${values.message}`;
      bridge.sendMessage(text);
    }

    // Optimistic confirmation state (production replaces this via toolResult on re-render).
    card.textContent = '';
    card.appendChild(header);
    renderConfirmation(card, {
      message: `Thanks, ${values.full_name}! Your request for a demo of ${values.solution_of_interest} has been submitted. Our team will follow up at ${values.email}.`,
    });
    if (bridge) bridge.reportSize(block.offsetWidth, block.offsetHeight);
  });

  card.appendChild(form);
  block.appendChild(card);
}
