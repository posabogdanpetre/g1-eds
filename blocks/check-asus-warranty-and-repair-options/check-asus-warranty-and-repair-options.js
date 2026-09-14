// codegen:layout-pattern=generic-detail
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult (flat warranty-result object).
const SAMPLE_DATA = {
  model_name: 'ASUS Zenbook A16 (UX3607)',
  serial_number_masked: '••••••••3E7301',
  warranty_status: 'In Warranty',
  warranty_start_date: '2025-11-02',
  warranty_end_date: '2026-11-01',
  service_eligibility: 'Eligible for standard warranty repair and remote diagnostics',
  repair_options: [
    {
      option_name: 'In-Warranty Repair',
      description: 'Covered hardware repair for the flickering display under your active ASUS warranty.',
      requirements: ['Active warranty', 'Proof of purchase may be requested'],
      action_url: 'https://www.asus.com/support/repair/',
    },
    {
      option_name: 'Remote Diagnostic',
      description: 'Guided ASUS diagnostic to confirm whether the display issue needs a physical repair.',
      requirements: ['Device powers on', 'Stable internet'],
      action_url: 'https://www.asus.com/support/',
    },
    {
      option_name: 'Find Service Center',
      description: 'Locate an authorized ASUS service center near you for walk-in display service.',
      requirements: ['Country selected'],
      action_url: 'https://www.asus.com/support/service-center/',
    },
    {
      option_name: 'Check Repair Status',
      description: 'Track an existing RMA or repair order by its repair number.',
      requirements: ['Existing repair number'],
      action_url: 'https://www.asus.com/support/repair-status/',
    },
  ],
  repair_status: null,
  proof_of_purchase_required: true,
  backup_warning: 'Back up your data before sending the device in — repairs may reset or replace storage.',
  message: 'Your ASUS Zenbook A16 is in warranty until 2026-11-01 and eligible for repair.',
};

// Brand colors from DESIGN_TOKENS (ASUS Incisive Blue).
const PALETTE = ['#006ce1', '#00a3e7', '#0051a8'];
const CTA_REST = '#006ce1';
const CTA_HOVER = '#0051a8';

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

function ctaLabelFor(option) {
  const name = (option.option_name || '').toLowerCase();
  const desc = (option.description || '').toLowerCase();
  const hay = `${name} ${desc}`;
  if (hay.includes('status') || hay.includes('track') || hay.includes('rma')) return 'Check Repair Status';
  if (hay.includes('diagnostic')) return 'Request Diagnostic';
  if (hay.includes('service center') || hay.includes('service centre') || hay.includes('locate') || hay.includes('walk-in')) return 'Find Service Center';
  if (hay.includes('self-repair') || hay.includes('self repair') || hay.includes('diy')) return 'Start Self-Repair';
  return 'Request Repair';
}

function statusTone(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('in warranty') || s.includes('active') || s.includes('valid') || s.includes('eligible')) return 'ok';
  if (s.includes('expired') || s.includes('out of') || s.includes('void') || s.includes('lapsed')) return 'bad';
  return 'neutral';
}

function makeFact(label, value) {
  const cell = document.createElement('div');
  cell.className = 'warranty-fact';
  const l = document.createElement('span');
  l.className = 'warranty-fact-label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'warranty-fact-value';
  v.textContent = value;
  cell.append(l, v);
  return cell;
}

function renderDashboard(block, data, bridge) {
  block.textContent = '';
  const root = document.createElement('div');
  root.className = 'warranty-dashboard';

  // Summary block
  const summary = document.createElement('div');
  summary.className = 'warranty-summary';
  summary.style.cssText = `background:${theme?.bg ?? '#00264d'};color:${theme?.fg ?? '#fff'}`;

  const head = document.createElement('div');
  head.className = 'warranty-head';
  const title = document.createElement('h3');
  title.className = 'warranty-model';
  title.textContent = data.model_name || 'ASUS Device';
  head.appendChild(title);

  if (data.warranty_status) {
    const chip = document.createElement('span');
    chip.className = `warranty-chip warranty-chip--${statusTone(data.warranty_status)}`;
    chip.textContent = data.warranty_status;
    head.appendChild(chip);
  }
  summary.appendChild(head);

  const facts = document.createElement('div');
  facts.className = 'warranty-facts';
  if (data.serial_number_masked) facts.appendChild(makeFact('Serial', data.serial_number_masked));
  if (data.warranty_end_date) facts.appendChild(makeFact('Warranty ends', data.warranty_end_date));
  if (data.service_eligibility) facts.appendChild(makeFact('Eligibility', data.service_eligibility));
  summary.appendChild(facts);
  root.appendChild(summary);

  // Notices
  if (data.backup_warning) {
    const warn = document.createElement('div');
    warn.className = 'warranty-warning';
    const icon = document.createElement('span');
    icon.className = 'warranty-warning-icon';
    icon.textContent = '⚠';
    icon.setAttribute('aria-hidden', 'true');
    const txt = document.createElement('span');
    txt.textContent = data.backup_warning;
    warn.append(icon, txt);
    root.appendChild(warn);
  }

  if (data.proof_of_purchase_required) {
    const pop = document.createElement('span');
    pop.className = 'warranty-pop';
    pop.textContent = 'Proof of purchase may be required';
    root.appendChild(pop);
  }

  // Repair options
  const options = Array.isArray(data.repair_options) ? data.repair_options : [];
  if (options.length) {
    const wrapper = document.createElement('div');
    wrapper.className = 'warranty-options-wrapper';
    const rail = document.createElement('div');
    rail.className = 'warranty-options';

    options.forEach((opt) => {
      const card = document.createElement('div');
      card.className = 'warranty-option-card';
      card.style.cssText = `background:${theme?.bg ?? '#00264d'};color:${theme?.fg ?? '#fff'}`;

      const oname = document.createElement('div');
      oname.className = 'warranty-option-name';
      oname.textContent = opt.option_name || 'Service Option';
      card.appendChild(oname);

      if (opt.description) {
        const odesc = document.createElement('p');
        odesc.className = 'warranty-option-desc';
        odesc.textContent = opt.description;
        card.appendChild(odesc);
      }

      const reqs = Array.isArray(opt.requirements) ? opt.requirements : [];
      if (reqs.length) {
        const oreq = document.createElement('div');
        oreq.className = 'warranty-option-req';
        oreq.textContent = reqs.join(' · ');
        card.appendChild(oreq);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'warranty-cta';
      btn.textContent = ctaLabelFor(opt);
      const url = opt.action_url;
      const optName = opt.option_name || 'this option';
      btn.addEventListener('click', () => {
        if (!bridge) return;
        if (url) bridge.openLink(url);
        else bridge.sendMessage(`Tell me more about ${optName}`);
      });
      card.appendChild(btn);

      rail.appendChild(card);
    });

    wrapper.appendChild(rail);
    const fade = document.createElement('div');
    fade.className = 'warranty-fade';
    fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#00264d'}cc);pointer-events:none;`;
    wrapper.appendChild(fade);
    root.appendChild(wrapper);
  }

  block.appendChild(root);
}

export default async function decorate(block, bridge) {
  let data;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      data = SAMPLE_DATA;
    } else {
      // Detail/single-object concept — structuredContent IS the flat item.
      const _result = await bridge.toolResult;
      data = _result?.structuredContent || {};
    }
  } else {
    data = SAMPLE_DATA;
  }

  if (!data || !data.model_name) {
    block.textContent = '';
    const empty = document.createElement('p');
    empty.className = 'warranty-empty';
    empty.textContent = 'No warranty details were found for this device.';
    block.appendChild(empty);
  } else {
    renderDashboard(block, data, bridge);
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
