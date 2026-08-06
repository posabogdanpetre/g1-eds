// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Land Loans',
    description: 'Long-term loans to finance or refinance farmland, pastureland and other ground used for agricultural purposes.',
    price: '',
    category: 'Ag Real Estate Loan',
    image_url: 'https://assets.fcsamerica.com/transform/89983757-9fa8-4309-92c7-717c4fcd7525/Land_Loans_Hero?io=transform:fill,width:1920',
  },
  {
    name: 'Operating Line of Credit',
    description: 'A revolving operating line of credit with interest-saving benefits, flexible payment options and yearly cash-back dividends.',
    price: '',
    category: 'Operating Loan',
    image_url: 'https://assets.fcsamerica.com/transform/99c26295-8f64-4733-b357-22a74b3e0cce/Dollar-bills?io=transform:fill,width:480',
  },
  {
    name: 'Rural Home Loans',
    description: 'Specialized country-living financing through Rural 1st for existing country homes, acreages, land and new construction.',
    price: '',
    category: 'Home Loan',
    image_url: 'https://assets.fcsamerica.com/transform/20d6f2d1-5617-4dad-8903-bcecaae65ce3/finance-rural-1st-hero?io=transform:fill,width:1920',
  },
  {
    name: 'Equipment Financing',
    description: 'Simple, fast and flexible equipment financing through AgDirect with fixed and variable rates and terms from 2 to 7 years.',
    price: '',
    category: 'Equipment Financing',
    image_url: 'https://assets.fcsamerica.com/transform/f371c4e1-07f2-4b50-896d-f3c9f2fa160e/finance-equipment-loan-hero?io=transform:fill,width:1920',
  },
  {
    name: 'Livestock Loans',
    description: 'Financing for the purchase, care, feeding or refinancing of debt on livestock with fixed, adjustable or variable rates.',
    price: '',
    category: 'Livestock Loan',
    image_url: 'https://assets.fcsamerica.com/transform/c25b905c-ce1f-41a8-a56b-73fab4265630/finance-livestock-hero?io=transform:fill,width:1920',
  },
  {
    name: 'Ag Facility Loans',
    description: 'Financing for cattle and hog barns, farm storage buildings, grain bins and more, with flexible rate options.',
    price: '',
    category: 'Facility Loan',
    image_url: 'https://assets.fcsamerica.com/transform/807021c9-fc1b-4f98-8d54-72519f7bfd74/facilities-loan-hero?io=transform:fill,width:1920',
  },
  {
    name: 'Ag Leases',
    description: 'Leasing for farm storage buildings, grain bins, barns, equipment and vehicles, with lease payments that are typically 100% deductible.',
    price: '',
    category: 'Ag Lease',
    image_url: 'https://assets.fcsamerica.com/transform/7aa53bbc-c42e-4b37-adfc-452c0fe5458f/finance-leases-hero?io=transform:fill,width:1920',
  },
  {
    name: 'Crop Insurance',
    description: 'A full line of crop insurance products backed by non-commissioned agents who focus entirely on crop and livestock insurance.',
    price: '',
    category: 'Crop Insurance',
    image_url: 'https://assets.fcsamerica.com/transform/fe60234b-4588-4216-8c40-85d73fb55836/insurance-crop-insurance-hero?io=transform:fill,width:1920',
  },
];

// Brand palette from the action payload — darkened to derive the content-panel background.
const PALETTE = ['#008755', '#014838', '#f1b434', '#b9d341', '#2176b3'];

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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'get-product-details-card';

  const imgPanel = document.createElement('div');
  imgPanel.className = 'get-product-details-image-panel';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.className = 'get-product-details-image-placeholder';
    d.style.backgroundColor = theme ? theme.bg : '#014838';
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
    imgPanel.appendChild(img);
  } else {
    imgPanel.appendChild(colorDiv());
  }
  card.appendChild(imgPanel);

  const content = document.createElement('div');
  content.className = 'get-product-details-content';
  content.style.background = theme ? theme.bg : '#014838';
  content.style.color = theme ? theme.fg : '#ffffff';

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'get-product-details-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  const title = document.createElement('h2');
  title.className = 'get-product-details-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'get-product-details-description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  const cta = document.createElement('button');
  cta.className = 'get-product-details-cta';
  cta.type = 'button';
  cta.textContent = 'Get Started';
  if (bridge) {
    cta.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name || 'this product'}`);
    });
  }
  content.appendChild(cta);

  card.appendChild(content);
  block.appendChild(card);
}

function renderEmpty(block) {
  const empty = document.createElement('p');
  empty.className = 'get-product-details-empty';
  empty.textContent = 'No matching product was found.';
  block.appendChild(empty);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA[0];
  }

  block.textContent = '';
  if (!item || !item.name) {
    renderEmpty(block);
  } else {
    renderDetail(block, item, bridge);
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
