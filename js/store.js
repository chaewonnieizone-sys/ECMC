/* EC Marketing Corporation - Shared data layer (store.js)
 * localStorage keys: ecm_products, ecm_orders, ecm_inquiries, ecm_quotes, ecm_feedback, ecm_events
 * All storage access wrapped in try/catch with in-memory fallback.
 */
(function() {
  var memory = {};
  function canUseStorage() {
    try { var t = "__ecm_store__"; localStorage.setItem(t, "1"); localStorage.removeItem(t); return true; } catch(e) { return false; }
  }
  var storageOk = canUseStorage();

  function readRaw(key) {
    if (!storageOk) return memory.hasOwnProperty(key) ? memory[key] : null;
    try { return localStorage.getItem(key); } catch(e) { return memory.hasOwnProperty(key) ? memory[key] : null; }
  }
  function writeRaw(key, val) {
    memory[key] = val;
    if (!storageOk) return;
    try { localStorage.setItem(key, val); } catch(e) { /* memory fallback */ }
  }
  function removeRaw(key) {
    delete memory[key];
    if (!storageOk) return;
    try { localStorage.removeItem(key); } catch(e) {}
  }
  function readList(key) {
    try {
      var raw = readRaw(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  }
  function writeList(key, arr) {
    try { writeRaw(key, JSON.stringify(Array.isArray(arr) ? arr : [])); } catch(e) { writeRaw(key, "[]"); }
  }
  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8);
  }
  function nowIso() { return new Date().toISOString(); }

  function seedProducts() {
    if (typeof PRODUCTS_SEED !== "undefined" && Array.isArray(PRODUCTS_SEED)) return JSON.parse(JSON.stringify(PRODUCTS_SEED));
    if (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS)) return JSON.parse(JSON.stringify(PRODUCTS));
    return [];
  }
  function getProducts() {
    var raw = readRaw("ecm_products");
    if (raw === null || raw === undefined) return seedProducts();
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : seedProducts();
    } catch(e) { return seedProducts(); }
  }
  function setProducts(list) { writeList("ecm_products", list); syncGlobalProducts(); }
  function syncGlobalProducts() { try { var p = getProducts(); window.PRODUCTS = p; if (typeof syncProductsGlobal === "function") syncProductsGlobal(); } catch(e) {} }
  function saveProduct(product) {
    var list = getProducts();
    var idx = list.findIndex(function(p){ return p.id === product.id; });
    if (idx >= 0) list[idx] = product; else list.push(product);
    setProducts(list);
    return product;
  }
  function deleteProduct(id) {
    setProducts(getProducts().filter(function(p){ return p.id !== id; }));
  }

  function getOrders() { return readList("ecm_orders"); }
  function saveOrder(order) {
    var list = getOrders();
    var idx = list.findIndex(function(o){ return o.ref === order.ref || o.id === order.id; });
    if (idx >= 0) list[idx] = order; else list.unshift(order);
    writeList("ecm_orders", list);
    return order;
  }
  function updateOrder(ref, patch) {
    var list = getOrders();
    var idx = list.findIndex(function(o){ return o.ref === ref || o.id === ref; });
    if (idx < 0) return null;
    var o = list[idx];
    Object.keys(patch || {}).forEach(function(k){ o[k] = patch[k]; });
    list[idx] = o;
    writeList("ecm_orders", list);
    return o;
  }

  function getInquiries() { return readList("ecm_inquiries"); }
  function saveInquiry(rec) {
    var list = getInquiries();
    rec.id = rec.id || uid("inq");
    var idx = list.findIndex(function(x){ return x.id === rec.id; });
    if (idx >= 0) list[idx] = rec; else list.unshift(rec);
    writeList("ecm_inquiries", list);
    return rec;
  }
  function updateInquiry(id, patch) {
    var list = getInquiries();
    var idx = list.findIndex(function(x){ return x.id === id; });
    if (idx < 0) return null;
    Object.keys(patch||{}).forEach(function(k){ list[idx][k]=patch[k]; });
    writeList("ecm_inquiries", list);
    return list[idx];
  }

  function getQuotes() { return readList("ecm_quotes"); }
  function saveQuote(rec) {
    var list = getQuotes();
    rec.id = rec.id || uid("quote");
    var idx = list.findIndex(function(x){ return x.id === rec.id; });
    if (idx >= 0) list[idx] = rec; else list.unshift(rec);
    writeList("ecm_quotes", list);
    return rec;
  }
  function updateQuote(id, patch) {
    var list = getQuotes();
    var idx = list.findIndex(function(x){ return x.id === id; });
    if (idx < 0) return null;
    Object.keys(patch||{}).forEach(function(k){ list[idx][k]=patch[k]; });
    writeList("ecm_quotes", list);
    return list[idx];
  }

  function getFeedback() { return readList("ecm_feedback"); }
  function saveFeedback(rec) {
    var list = getFeedback();
    rec.id = rec.id || uid("fb");
    var idx = list.findIndex(function(x){ return x.id === rec.id; });
    if (idx >= 0) list[idx] = rec; else list.unshift(rec);
    writeList("ecm_feedback", list);
    return rec;
  }

  function getEvents() { return readList("ecm_events"); }
  function appendEvent(evt) {
    var list = getEvents();
    list.push(evt);
    if (list.length > 1000) list = list.slice(-1000);
    writeList("ecm_events", list);
  }

  function saveRecord(kind, rec) {
    if (kind === "ecm_orders" || kind === "orders") return saveOrder(rec);
    if (kind === "ecm_inquiries" || kind === "inquiries") return saveInquiry(rec);
    if (kind === "ecm_quotes" || kind === "quotes") return saveQuote(rec);
    if (kind === "ecm_feedback" || kind === "feedback") return saveFeedback(rec);
    if (kind === "ecm_products" || kind === "products") return saveProduct(rec);
    return rec;
  }

  function clearAll() {
    ["ecm_products","ecm_orders","ecm_inquiries","ecm_quotes","ecm_feedback","ecm_events","ecm_cart","ecm_admin_orders_seen"].forEach(removeRaw);
    try { syncGlobalProducts(); } catch(e) {}
  }
  function exportAll() {
    return {
      ecm_products: getProducts(),
      ecm_orders: getOrders(),
      ecm_inquiries: getInquiries(),
      ecm_quotes: getQuotes(),
      ecm_feedback: getFeedback(),
      ecm_events: getEvents()
    };
  }
  function exportData() { return JSON.stringify(exportAll(), null, 2); }
  function importAll(data) {
    if (!data || typeof data !== "object") return false;
    ["ecm_products","ecm_orders","ecm_inquiries","ecm_quotes","ecm_feedback","ecm_events"].forEach(function(k){
      if (Array.isArray(data[k])) writeList(k, data[k]);
    });
    try { syncGlobalProducts(); } catch(e) {}
    return true;
  }
  function importData(jsonText) {
    var data = (typeof jsonText === "string") ? JSON.parse(jsonText) : jsonText;
    return importAll(data);
  }

  function getNewOrdersCount() {
    return getOrders().filter(function(o){ return (o.status || "New") === "New"; }).length;
  }

  try { syncGlobalProducts(); } catch(e) {}
  window.ECMStore = {
    readList: readList, writeList: writeList, readRaw: readRaw, writeRaw: writeRaw,
    uid: uid, nowIso: nowIso,
    getProducts: getProducts, setProducts: setProducts, saveProduct: saveProduct, deleteProduct: deleteProduct,
    getOrders: getOrders, saveOrder: saveOrder, updateOrder: updateOrder,
    getInquiries: getInquiries, saveInquiry: saveInquiry, updateInquiry: updateInquiry,
    getQuotes: getQuotes, saveQuote: saveQuote, updateQuote: updateQuote,
    getFeedback: getFeedback, saveFeedback: saveFeedback,
    saveRecord: saveRecord,
    getEvents: getEvents, appendEvent: appendEvent,
    clearAll: clearAll, exportAll: exportAll, importAll: importAll, exportData: exportData, importData: importData,
    getNewOrdersCount: getNewOrdersCount
  };
})();
