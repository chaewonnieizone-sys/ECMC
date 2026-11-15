// Cart storage with in-memory fallback (supports product option selections)
(function() {
  var memoryCart = [];
  function canUseStorage() {
    try { var t = "__ecm__"; localStorage.setItem(t, "1"); localStorage.removeItem(t); return true; } catch(e) { return false; }
  }
  var storageOk = canUseStorage();

  function readCart() {
    if (!storageOk) return memoryCart.slice();
    try {
      var raw = localStorage.getItem("ecm_cart");
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return memoryCart.slice(); }
  }
  function writeCart(cart) {
    memoryCart = cart.slice();
    if (!storageOk) return;
    try { localStorage.setItem("ecm_cart", JSON.stringify(cart)); } catch(e) { /* fallback to memory */ }
  }
  function normSel(sel) {
    if (!sel || typeof sel !== "object") return {};
    var out = {};
    Object.keys(sel).sort().forEach(function(k){ if (sel[k] !== undefined && sel[k] !== null && sel[k] !== "") out[k] = String(sel[k]); });
    return out;
  }
  function sameSel(a,b) {
    var ka = Object.keys(a||{}).sort(), kb = Object.keys(b||{}).sort();
    if (ka.length !== kb.length) return false;
    for (var i=0;i<ka.length;i++) if (ka[i]!==kb[i] || (a[ka[i]]!==b[kb[i]])) return false;
    return true;
  }
  function resolveItem(item) {
    var p = typeof getProductById === "function" ? getProductById(item.id) : null;
    if (!p) return { product: null, resolved: null };
    var resolved = (typeof resolveProduct === "function") ? resolveProduct(p, item.selections || {}) : p;
    return { product: p, resolved: resolved };
  }

  function getCart() { return readCart(); }
  function saveCart(cart) { writeCart(cart); updateCartBadge(); }
  function addToCart(id, qty, selections) {
    var q = Math.max(1, parseInt(qty || 1, 10));
    var sel = normSel(selections);
    var cart = getCart();
    var item = cart.find(function(i){ return i.id === id && sameSel(normSel(i.selections), sel); });
    if (item) item.qty += q; else cart.push({ id: id, qty: q, selections: sel });
    saveCart(cart);
    if (typeof trackEvent === "function") trackEvent("add_to_cart", { id: id, qty: q, selections: sel });
  }
  function updateQty(id, qty, selections) {
    var q = parseInt(qty, 10);
    var sel = normSel(selections);
    var cart = getCart();
    if (isNaN(q) || q <= 0) {
      cart = cart.filter(function(i){ return !(i.id === id && sameSel(normSel(i.selections), sel)); });
    } else {
      cart.forEach(function(i){ if (i.id === id && sameSel(normSel(i.selections), sel)) i.qty = q; });
    }
    saveCart(cart);
  }
  function removeFromCart(id, selections) {
    var sel = normSel(selections);
    saveCart(getCart().filter(function(i){ return !(i.id === id && sameSel(normSel(i.selections), sel)); }));
  }
  function clearCart() { saveCart([]); }
  function cartCount() { return getCart().reduce(function(s,i){ return s + (parseInt(i.qty,10)||0); }, 0); }
  function cartHasNullPrice() {
    return getCart().some(function(i){
      var r = resolveItem(i);
      return !r.resolved || r.resolved.price === null || r.resolved.price === undefined;
    });
  }
  function cartSubtotal() {
    if (cartHasNullPrice()) return null;
    return getCart().reduce(function(sum,i){
      var r = resolveItem(i);
      return sum + (Number(r.resolved.price) * i.qty);
    }, 0);
  }
  function updateCartBadge() {
    var n = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function(el){
      el.textContent = String(n);
      el.classList.toggle("d-none", n === 0);
    });
  }

  window.ECMCart = { getCart: getCart, saveCart: saveCart, addToCart: addToCart, updateQty: updateQty, removeFromCart: removeFromCart, clearCart: clearCart, cartCount: cartCount, cartSubtotal: cartSubtotal, cartHasNullPrice: cartHasNullPrice, updateCartBadge: updateCartBadge, normSel: normSel, sameSel: sameSel, resolveItem: resolveItem };
})();
