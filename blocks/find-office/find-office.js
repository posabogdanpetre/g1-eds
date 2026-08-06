// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    name: 'Farm Credit Services of America — Grand Island',
    address: '3335 W Capital Ave, Grand Island, NE 68803',
    phone: '(308) 384-4300',
  },
  {
    name: 'Farm Credit Services of America — Aurora',
    address: '1204 11th St, Aurora, NE 68818',
    phone: '(402) 694-2100',
  },
  {
    name: 'Farm Credit Services of America — Kearney',
    address: '4901 2nd Ave, Kearney, NE 68847',
    phone: '(308) 234-6285',
  },
];

// Brand palette from the action payload.
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#008755', '#014838', '#f1b434', '#b9d341', '#2176b3'];
const ACCENT = PALETTE[0];

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

function renderResults(block, offices, bridge) {
  const results = document.createElement('div');
  results.className = 'find-office-results';

  offices.slice(0, 2).forEach((office) => {
    const card = document.createElement('div');
    card.className = 'find-office-store-card';
    card.style.background = theme ? theme.bg : '#014838';
    card.style.color = theme ? theme.fg : '#ffffff';

    const pin = document.createElement('div');
    pin.className = 'find-office-store-pin';
    pin.textContent = '●';
    card.appendChild(pin);

    const name = document.createElement('div');
    name.className = 'find-office-store-name';
    name.textContent = office.name || '';
    card.appendChild(name);

    if (office.address) {
      const addr = document.createElement('div');
      addr.className = 'find-office-store-addr';
      addr.textContent = office.address;
      card.appendChild(addr);
    }

    if (office.phone) {
      const phone = document.createElement('button');
      phone.className = 'find-office-store-phone';
      phone.type = 'button';
      phone.textContent = office.phone;
      if (bridge) {
        phone.addEventListener('click', () => {
          bridge.sendMessage(`Tell me more about the ${office.name} office`);
        });
      }
      card.appendChild(phone);
    }

    results.appendChild(card);
  });

  block.appendChild(results);
}

function renderEmpty(block, offices, bridge) {
  const empty = document.createElement('div');
  empty.className = 'find-office-empty';

  const formCard = document.createElement('div');
  formCard.className = 'find-office-form-card';
  formCard.style.background = theme ? theme.bg : '#014838';
  formCard.style.color = theme ? theme.fg : '#ffffff';

  const pin = document.createElement('span');
  pin.className = 'find-office-pin';
  pin.textContent = '●';
  pin.style.color = theme ? theme.fg : '#ffffff';
  formCard.appendChild(pin);

  const heading = document.createElement('h3');
  heading.className = 'find-office-heading';
  heading.textContent = 'Find an office near you';
  heading.style.color = theme ? theme.fg : '#ffffff';
  formCard.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-office-input';
  input.placeholder = 'Enter ZIP code...';
  input.setAttribute('aria-label', 'ZIP code');
  formCard.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'find-office-search-btn';
  btn.type = 'button';
  btn.textContent = 'Find Your Local Office';
  btn.style.background = ACCENT;
  formCard.appendChild(btn);

  const submit = () => {
    const zip = input.value.trim();
    if (bridge) {
      bridge.sendMessage(zip ? `Find Farm Credit Services of America offices near ${zip}` : 'Find a Farm Credit Services of America office near me');
      return;
    }
    block.textContent = '';
    renderResults(block, offices, null);
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  empty.appendChild(formCard);
  block.appendChild(empty);
}

export default async function decorate(block, bridge) {
  let offices = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.offices — derived from action name "find_office" (bare array outputSchema rule)
      offices = structuredContent?.offices || [];
    }
  }

  block.textContent = '';
  if (offices && offices.length) {
    renderResults(block, offices, bridge);
  } else {
    renderEmpty(block, SAMPLE_DATA, bridge);
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
