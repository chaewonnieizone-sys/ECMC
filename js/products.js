/* EC Marketing Corporation - Product Data
 * Edit this file to update products and prices.
 * price: number (pesos) or null for "Ask for price"
 * options: [{ name: "Label", key: "optionKey", choices: [{ value, label, price?, image? }] }]
 * variants: specific stocked combinations (optional) to override price/size/image/stock per selection
 */
var PRODUCTS_SEED = [
  { id: "cement-1", name: "Portland Cement Type 1", brand: "Republic Cement", category: "Construction materials", size: "40 kg bag", description: "General-purpose Type 1 Portland cement for concrete, masonry, and plastering work.", price: 245.00, image: "images/cement-republic.jpg", badge: "Republic", inStock: true, audience: ["Contractors", "Construction companies", "Stores and resellers", "Homeowners"] },
  { id: "steel-1", name: "Deformed Steel Bar", brand: "SteelAsia", category: "Construction materials", size: "Assorted sizes", description: "Grade 40 deformed reinforcing steel bar for structural concrete applications. Select diameter and length.", price: 185.00, image: "images/steel-rebar.jpg", badge: "SteelAsia", inStock: true, audience: ["Contractors", "Construction companies", "Stores and resellers"],
    options: [
      { name: "Diameter / Length", key: "size", choices: [
        { value: "10mm x 6m", label: "10 mm x 6 m", price: 185.00 },
        { value: "12mm x 6m", label: "12 mm x 6 m", price: 245.00 },
        { value: "16mm x 6m", label: "16 mm x 6 m", price: 420.00 },
        { value: "20mm x 6m", label: "20 mm x 6 m", price: 650.00 }
      ]}
    ]
  },
  { id: "tank-besta", name: "Bestank Water Storage Tank", brand: "Bestank", category: "Water tanks", size: "Select capacity", description: "Durable polyethylene water storage tank for household and project use. Select capacity.", price: 3500.00, image: "images/tank-bestank.jpg", badge: "Bestank", inStock: true, audience: ["Contractors", "Construction companies", "Homeowners", "Stores and resellers"],
    options: [
      { name: "Capacity", key: "capacity", choices: [
        { value: "400L", label: "400 L", price: 3500.00 },
        { value: "1000L", label: "1000 L", price: 6500.00 },
        { value: "2000L", label: "2000 L", price: 11000.00 }
      ]}
    ]
  },
  { id: "tank-firsta", name: "Firstank Stainless Steel Water Tank", brand: "Firstank", category: "Water tanks", size: "Select capacity", description: "Stainless steel water tank designed for clean and long-lasting storage. Select capacity.", price: 12000.00, image: "images/tank-firstank.jpg", badge: "Firstank", inStock: true, audience: ["Contractors", "Construction companies", "Homeowners", "Stores and resellers"],
    options: [
      { name: "Capacity", key: "capacity", choices: [
        { value: "400L", label: "400 L", price: 12000.00 },
        { value: "1000L", label: "1000 L", price: 22000.00 },
        { value: "2000L", label: "2000 L", price: 38000.00 },
        { value: "4000L", label: "4000 L", price: 65000.00 }
      ]}
    ]
  },
  { id: "bosch-drill", name: "Bosch Impact Drill", brand: "Bosch", category: "Power tools", size: "GSB 550 (550W)", description: "Reliable Bosch impact drill for drilling tasks in construction and home improvement.", price: 3200.00, image: "images/bosch-gsb550.jpg", badge: "Bosch", inStock: true, audience: ["Contractors", "Construction companies", "Homeowners"] },
  { id: "bosch-grinder", name: "Bosch Angle Grinder", brand: "Bosch", category: "Power tools", size: "GWS 060 (670W)", description: "Versatile angle grinder for cutting, grinding, and finishing work.", price: 2100.00, image: "images/bosch-gws060.jpg", badge: "Bosch", inStock: true, audience: ["Contractors", "Construction companies", "Homeowners"] },
  { id: "bosch-hammer", name: "Bosch Demolition Hammer", brand: "Bosch", category: "Power tools", size: "GSH 500 (1100W)", description: "Powerful demolition hammer for breaking and chiseling tough materials.", price: 18500.00, image: "images/bosch-gsh500.jpg", badge: "Bosch", inStock: true, audience: ["Contractors", "Construction companies"] },
  { id: "bosch-planer", name: "Bosch Planer", brand: "Bosch", category: "Power tools", size: "GHO 6500 (650W)", description: "Precision planer for smoothing and shaping wood surfaces.", price: 4800.00, image: "images/bosch-gho6500.jpg", badge: "Bosch", inStock: true, audience: ["Contractors", "Construction companies", "Homeowners"] },
  { id: "bosch-saw", name: "Bosch Circular Saw", brand: "Bosch", category: "Power tools", size: "GKS 140 (1400W)", description: "Dependable Bosch circular saw for accurate cutting in wood and other materials.", price: 5200.00, image: "images/bosch-gks140.jpg", badge: "Bosch", inStock: true, audience: ["Contractors", "Construction companies", "Homeowners"] },
  { id: "plumbing-1", name: "Plumbing Fixtures", brand: "Assorted", category: "Hardware & paint", size: "Select type", description: "Plumbing fixtures for installation, repair, and maintenance. Select type and brand.", price: 150.00, image: "images/plumbing-fixtures.jpg", badge: "", inStock: true, audience: ["Contractors", "Construction companies", "Stores and resellers", "Homeowners"],
    options: [
      { name: "Type", key: "type", choices: [
        { value: "Faucet", label: "Faucet" },
        { value: "Shower head", label: "Shower head" },
        { value: "Angle valve", label: "Angle valve" },
        { value: "Flexible hose", label: "Flexible hose" },
        { value: "P-trap / fittings", label: "P-trap / fittings" }
      ]},
      { name: "Brand", key: "brand", choices: [
        { value: "American Standard", label: "American Standard", price: 950.00 },
        { value: "HCG", label: "HCG", price: 850.00 },
        { value: "Wilcon Depot Essentials", label: "Wilcon Depot Essentials", price: 350.00 },
        { value: "Generic", label: "Generic", price: 150.00 }
      ]}
    ]
  },
  { id: "electrical-1", name: "Electrical Supplies", brand: "Assorted", category: "Hardware & paint", size: "Select type", description: "Wiring and electrical supplies for safe installations. Select type and brand.", price: 250.00, image: "images/electrical-wiring.jpg", badge: "", inStock: true, audience: ["Contractors", "Construction companies", "Stores and resellers", "Homeowners"],
    options: [
      { name: "Type", key: "type", choices: [
        { value: "THHN wire 2.0mm (per meter)", label: "THHN wire 2.0 mm (per meter)", price: 28.00 },
        { value: "THHN wire 3.5mm (per meter)", label: "THHN wire 3.5 mm (per meter)", price: 45.00 },
        { value: "Electrical tape", label: "Electrical tape (roll)", price: 45.00 },
        { value: "Outlet", label: "Outlet", price: 120.00 },
        { value: "Switch", label: "Switch", price: 95.00 },
        { value: "Junction box", label: "Junction box", price: 55.00 }
      ]},
      { name: "Brand", key: "brand", choices: [
        { value: "Philflex", label: "Philflex" },
        { value: "Phelps Dodge", label: "Phelps Dodge" },
        { value: "Omni", label: "Omni" },
        { value: "Firefly", label: "Firefly" }
      ]}
    ]
  },
  { id: "fasteners-1", name: "Fasteners", brand: "Assorted", category: "Hardware & paint", size: "Select type", description: "Nails, screws, bolts, and other fasteners for construction and repairs. Select type and size.", price: 120.00, image: "images/fasteners.jpg", badge: "", inStock: true, audience: ["Contractors", "Construction companies", "Stores and resellers", "Homeowners"],
    options: [
      { name: "Type", key: "type", choices: [
        { value: "Common nails", label: "Common nails" },
        { value: "Concrete nails", label: "Concrete nails" },
        { value: "Wood screws", label: "Wood screws" },
        { value: "Tek screws", label: "Tek screws (self-drilling)" },
        { value: "Bolts with nuts", label: "Bolts with nuts & washers" }
      ]},
      { name: "Size / Pack", key: "size", choices: [
        { value: "1 inch (1 kg)", label: '1" (1 kg pack)', price: 95.00 },
        { value: "2 inch (1 kg)", label: '2" (1 kg pack)', price: 95.00 },
        { value: "3 inch (1 kg)", label: '3" (1 kg pack)', price: 95.00 },
        { value: "4 inch (1 kg)", label: '4" (1 kg pack)', price: 100.00 },
        { value: "Assorted box", label: "Assorted box", price: 180.00 }
      ]}
    ]
  },
  { id: "paints-1", name: "Paint", brand: "Select brand", category: "Hardware & paint", size: "Select size", description: "Interior and exterior paints for finishing and protection. Select brand, color, finish, and size.", price: 750.00, image: "images/paints.jpg", badge: "", inStock: true, audience: ["Contractors", "Construction companies", "Stores and resellers", "Homeowners"],
    options: [
      { name: "Brand", key: "brand", choices: [
        { value: "Boysen", label: "Boysen" },
        { value: "Davies", label: "Davies" },
        { value: "Nippon Paint", label: "Nippon Paint" },
        { value: "Island Paints", label: "Island Paints" }
      ]},
      { name: "Color", key: "color", choices: [
        { value: "White", label: "White" },
        { value: "Off-white / Cream", label: "Off-white / Cream" },
        { value: "Gray", label: "Gray" },
        { value: "Beige", label: "Beige" },
        { value: "Blue", label: "Blue" },
        { value: "Green", label: "Green" },
        { value: "Brown", label: "Brown" },
        { value: "Red", label: "Red" },
        { value: "Custom / other", label: "Custom / other (specify in notes)" }
      ]},
      { name: "Finish", key: "finish", choices: [
        { value: "Latex (interior)", label: "Latex (interior)" },
        { value: "Latex (exterior)", label: "Latex (exterior)" },
        { value: "Enamel", label: "Enamel" },
        { value: "Primer", label: "Primer" }
      ]},
      { name: "Size", key: "size", choices: [
        { value: "1 liter", label: "1 liter", price: 220.00 },
        { value: "1 gallon (4L)", label: "1 gallon (4 L)", price: 750.00 },
        { value: "16 liter pail", label: "16 liter pail", price: 2650.00 }
      ]}
    ]
  },
  { id: "garden-1", name: "Outdoor Garden Supplies", brand: "Assorted", category: "Hardware & paint", size: "Select item", description: "Garden and outdoor supplies for maintenance and improvement. Select item.", price: 350.00, image: "images/garden-supplies.jpg", badge: "", inStock: true, audience: ["Homeowners", "Stores and resellers", "Contractors"],
    options: [
      { name: "Item", key: "item", choices: [
        { value: "Garden hose (10m)", label: "Garden hose (10 m)", price: 450.00 },
        { value: "Garden hose (20m)", label: "Garden hose (20 m)", price: 750.00 },
        { value: "Watering can", label: "Watering can", price: 250.00 },
        { value: "Hand trowel", label: "Hand trowel", price: 120.00 },
        { value: "Pruning shears", label: "Pruning shears", price: 350.00 },
        { value: "Rake", label: "Rake", price: 280.00 }
      ]}
    ]
  },
  { id: "ceiling-1", name: "Ceiling Panels", brand: "To be announced", category: "Construction materials", size: "Specifications to be added", description: "Decorative ceiling panel options planned for customers improving home interiors. Contact the shop for available designs and sizes.", price: null, image: "images/ceiling-panels.jpg", badge: "New / Coming soon", inStock: false, audience: ["Contractors", "Construction companies", "Homeowners"] },
  { id: "wall-1", name: "Wall Panels", brand: "To be announced", category: "Construction materials", size: "Specifications to be added", description: "Wall panel options planned for customers seeking better-looking home finishes. Contact the shop for available designs and sizes.", price: null, image: "images/wall-panels.jpg", badge: "New / Coming soon", inStock: false, audience: ["Contractors", "Construction companies", "Homeowners"] }
];

// Legacy ID aliases (keeps old links/cart items working after product consolidation)
var PRODUCT_ALIASES = {
  "tank-besta-400": "tank-besta", "tank-besta-1000": "tank-besta", "tank-besta-2000": "tank-besta",
  "tank-firsta-400": "tank-firsta", "tank-firsta-1000": "tank-firsta", "tank-firsta-2000": "tank-firsta", "tank-firsta-4000": "tank-firsta"
};

function getProductsList() {
  try {
    if (window.ECMStore && typeof ECMStore.getProducts === "function") {
      var list = ECMStore.getProducts();
      if (Array.isArray(list) && list.length) return list;
    }
  } catch(e) {}
  return (typeof PRODUCTS_SEED !== "undefined" && Array.isArray(PRODUCTS_SEED)) ? PRODUCTS_SEED : [];
}
function syncProductsGlobal() {
  try { window.PRODUCTS = getProductsList(); } catch(e) { window.PRODUCTS = (typeof PRODUCTS_SEED!=="undefined"?PRODUCTS_SEED:[]); }
}
if (typeof window !== "undefined") { window.PRODUCTS = (typeof PRODUCTS_SEED !== "undefined") ? PRODUCTS_SEED.slice() : []; }

function getProductById(id) {
  if (!id) return null;
  var list = getProductsList();
  var p = list.find(function(x) { return x.id === id; });
  if (p) return p;
  var alias = PRODUCT_ALIASES[id];
  return alias ? list.find(function(x) { return x.id === alias; }) || null : null;
}

function productHasOptions(p) {
  return !!(p && Array.isArray(p.options) && p.options.length);
}

function getSelectedChoices(p, selections) {
  selections = selections || {};
  if (!productHasOptions(p)) return [];
  return p.options.map(function(opt) {
    var val = selections[opt.key];
    var choice = opt.choices.find(function(c) { return c.value === val; }) || opt.choices[0];
    return { key: opt.key, name: opt.name, value: choice ? choice.value : "", label: choice ? choice.label : "" };
  });
}

function selectionsKey(selections) {
  if (!selections || typeof selections !== "object") return "";
  var keys = Object.keys(selections).sort();
  if (!keys.length) return "";
  return keys.map(function(k){ return k + "=" + selections[k]; }).join("|");
}

function resolveProduct(p, selections) {
  if (!p) return null;
  selections = selections || {};
  var resolved = {
    id: p.id, name: p.name, brand: p.brand, category: p.category,
    size: p.size, description: p.description, price: p.price, image: p.image,
    badge: p.badge, inStock: p.inStock, audience: p.audience || [], selections: {}
  };
  if (!productHasOptions(p)) return resolved;
  var parts = [];
  var priceSet = false;
  p.options.forEach(function(opt) {
    var choice = opt.choices.find(function(c) { return c.value === selections[opt.key]; }) || opt.choices[0];
    if (!choice) return;
    resolved.selections[opt.key] = choice.value;
    parts.push(choice.label);
    if (choice.price !== undefined && choice.price !== null) { resolved.price = Number(choice.price); priceSet = true; }
    if (choice.image) resolved.image = choice.image;
    if (choice.brand) resolved.brand = choice.brand;
    if (choice.inStock !== undefined) resolved.inStock = !!choice.inStock;
  });
  if (resolved.selections.brand) resolved.brand = resolved.selections.brand;
  if (parts.length) resolved.variantLabel = parts.join(" / ");
  if (resolved.variantLabel) resolved.size = resolved.variantLabel;
  if (!priceSet && p.price !== null && p.price !== undefined) resolved.price = p.price;
  return resolved;
}

function variantLabel(selections) {
  if (!selections) return "";
  if (typeof selections === "string") return selections;
  var vals = Object.keys(selections).map(function(k){ return selections[k]; }).filter(Boolean);
  return vals.join(" / ");
}

function formatPeso(value) {
  if (value === null || value === undefined || value === "") return "Ask for price";
  var num = Number(value);
  if (isNaN(num)) return "Ask for price";
  return "₱" + num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
