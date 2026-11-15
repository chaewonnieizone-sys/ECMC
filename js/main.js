(function () {
  "use strict";

  /* ========= Theme ========= */
  var THEME_KEY = "ecm_theme";
  function getSavedTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function saveTheme(v) { try { localStorage.setItem(THEME_KEY, v); } catch (e) {} }
  function systemPrefersDark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    var btns = document.querySelectorAll("[data-theme-toggle], #themeToggle");
    btns.forEach(function (btn) {
      var isDark = theme === "dark";
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      if (btn.id === "themeToggle" || btn.hasAttribute("data-theme-label")) {
        var icon = btn.querySelector("i");
        var txt = btn.querySelector("[data-theme-text]");
        if (icon) icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
        if (txt) txt.textContent = isDark ? "Light" : "Dark";
      } else {
        btn.innerHTML = isDark ? '<i class="bi bi-sun" aria-hidden="true"></i><span class="d-none d-xl-inline ms-1">Light</span>' : '<i class="bi bi-moon-stars" aria-hidden="true"></i><span class="d-none d-xl-inline ms-1">Dark</span>';
      }
    });
  }
  function initTheme() {
    var saved = getSavedTheme();
    applyTheme(saved || "dark");
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-theme-toggle], #themeToggle");
      if (!btn) return;
      var cur = document.documentElement.getAttribute("data-bs-theme") || "light";
      var next = cur === "dark" ? "light" : "dark";
      saveTheme(next);
      applyTheme(next);
    });
  }

  /* ========= Events / analytics (preserved) ========= */
  window.dataLayer = window.dataLayer || [];
  window.trackEvent = function(name, data) {
    var evt = { event: name, ts: new Date().toISOString(), data: data || {} };
    try { window.dataLayer.push(evt); } catch(e) {}
    try { console.log("[trackEvent]", evt); } catch(e) {}
    try { if (typeof window.gtag === "function") window.gtag("event", name, data || {}); } catch(e) {}
    try { if (typeof window.fbq === "function") window.fbq("trackCustom", name, data || {}); } catch(e) {}
    try { if (window.ECMStore && typeof ECMStore.appendEvent === "function") ECMStore.appendEvent(evt); } catch(e) {}
  };
  window.ECM_ANALYTICS = window.ECM_ANALYTICS || { gaId: "", metaPixelId: "" };
  (function loadAnalytics() {
    var cfg = window.ECM_ANALYTICS || {};
    if (cfg.gaId) {
      var gs = document.createElement("script");
      gs.async = true;
      gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.gaId);
      document.head.appendChild(gs);
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.gaId);
    }
    if (cfg.metaPixelId) {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,"script","https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", cfg.metaPixelId);
      window.fbq("track", "PageView");
    }
  })();

  /* ========= Active nav ========= */
  function setActiveNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".navbar .nav-link[href]").forEach(function(a){
      var href = (a.getAttribute("href") || "").toLowerCase().split("?")[0];
      if (!href) return;
      if (href === path) { a.classList.add("active"); a.setAttribute("aria-current","page"); }
    });
  }

  /* ========= Sticky shrink nav ========= */
  function initShrinkNav() {
    var nav = document.querySelector(".navbar-main");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add("is-shrunk");
      else nav.classList.remove("is-shrunk");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ========= Open now (PH time) ========= */
  function computeOpenNow() {
    // Store hours: Mon–Fri 8:00–17:00, Sat 8:00–13:00, Sun closed (Philippine time UTC+8)
    try {
      var now = new Date();
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      var ph = new Date(utc + (3600000 * 8));
      var day = ph.getDay(); // 0 Sun .. 6 Sat
      var mins = ph.getHours() * 60 + ph.getMinutes();
      var open = false;
      if (day >= 1 && day <= 5) open = mins >= 480 && mins < 1020; // 08:00-17:00
      else if (day === 6) open = mins >= 480 && mins < 780; // 08:00-13:00
      return open;
    } catch (e) { return null; }
  }
  function renderOpenNow() {
    var els = document.querySelectorAll("[data-open-now]");
    if (!els.length) return;
    var open = computeOpenNow();
    els.forEach(function (el) {
      if (open === null) { el.textContent = "Hours: Mon–Fri 8–5, Sat 8–1"; return; }
      if (open) {
        el.innerHTML = '<span class="badge text-bg-success open-now-badge me-1">- Open now</span><span class="d-none d-sm-inline">Mon–Fri 8:00 AM–5:00 PM · Sat 8:00 AM–1:00 PM</span><span class="d-sm-none">Open now</span>';
      } else {
        el.innerHTML = '<span class="badge text-bg-secondary open-now-badge me-1">• Closed now</span><span class="d-none d-sm-inline">Mon–Fri 8:00 AM–5:00 PM · Sat 8:00 AM–1:00 PM</span><span class="d-sm-none">Closed now</span>';
      }
    });
  }

  /* ========= Toast & cart UI (preserved/enhanced) ========= */
  function showToast(message) {
    var container = document.getElementById("toastContainer");
    if (!container) return;
    var el = document.createElement("div");
    el.className = "toast align-items-center text-bg-dark border-0";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    var body = document.createElement("div");
    body.className = "d-flex";
    var msg = document.createElement("div");
    msg.className = "toast-body";
    msg.textContent = message;
    var close = document.createElement("button");
    close.type = "button";
    close.className = "btn-close btn-close-white me-2 m-auto";
    close.setAttribute("data-bs-dismiss", "toast");
    close.setAttribute("aria-label", "Close");
    body.appendChild(msg); body.appendChild(close); el.appendChild(body);
    container.appendChild(el);
    var t = new bootstrap.Toast(el, { delay: 2500 });
    el.addEventListener("hidden.bs.toast", function(){ el.remove(); });
    t.show();
  }

  function pulseCartBadge() {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.classList.remove("pulse");
      void el.offsetWidth;
      el.classList.add("pulse");
    });
  }

function renderOffcanvasCart() {
    var wrap = document.getElementById("offcanvasCartBody");
    var footer = document.getElementById("offcanvasCartFooter");
    if (!wrap || !window.ECMCart) return;
    var cart = ECMCart.getCart();
    wrap.innerHTML = "";
    if (!cart.length) {
      var empty = document.createElement("p");
      empty.className = "text-body-secondary text-center py-4 mb-0";
      empty.textContent = "Your cart is empty.";
      wrap.appendChild(empty);
      if (footer) footer.textContent = "";
      return;
    }
    var list = document.createElement("div");
    list.className = "list-group list-group-flush cart-list";
    cart.forEach(function(item){
      var r = ECMCart.resolveItem(item);
      var p = r.product, d = r.resolved;
      var name = d ? d.name : "Unknown product";
      var variant = d && d.variantLabel ? d.variantLabel : (p ? p.size : "");
      var priceText = d ? formatPeso(d.price) : "Ask for price";
      var imageUrl = d ? d.image : (p ? p.image : "");
      var row = document.createElement("div");
      row.className = "list-group-item px-0 cart-item";
      var top = document.createElement("div"); top.className = "d-flex gap-3 align-items-start";
      var imgWrap = document.createElement("div");
      imgWrap.className = "cart-item-img flex-shrink-0";
      imgWrap.innerHTML = imageUrl
        ? '<img src="' + imageUrl + '" alt="" class="rounded" style="width:64px;height:64px;object-fit:cover;" loading="lazy">'
        : '<div class="rounded bg-body-tertiary d-flex align-items-center justify-content-center" style="width:64px;height:64px;"><i class="bi bi-box-seam text-body-tertiary" style="font-size:1.5rem;"></i></div>';
      var content = document.createElement("div"); content.className = "flex-grow-1 min-w-0";
      var titleRow = document.createElement("div"); titleRow.className = "d-flex justify-content-between align-items-start gap-2";
      var left = document.createElement("div");
      var title = document.createElement("div"); title.className = "fw-semibold small"; title.textContent = name;
      var meta = document.createElement("div"); meta.className = "small text-body-secondary mt-1";
      meta.textContent = ((d ? d.brand : (p ? p.brand : "")) || "") + (variant ? " · " + variant : "") + " · " + priceText;
      left.appendChild(title); left.appendChild(meta);
      var rm = document.createElement("button"); rm.type="button"; rm.className="btn btn-sm btn-outline-danger min-touch flex-shrink-0"; rm.textContent="Remove"; rm.setAttribute("aria-label", "Remove " + name);
      rm.addEventListener("click", function(){ ECMCart.removeFromCart(item.id, item.selections); renderOffcanvasCart(); if (typeof renderCartPage === "function") renderCartPage(); showToast("Removed from cart"); });
      titleRow.appendChild(left); titleRow.appendChild(rm);
      var controls = document.createElement("div"); controls.className="d-flex align-items-center gap-2 mt-2";
      var minus = document.createElement("button"); minus.type="button"; minus.className="btn btn-sm btn-outline-secondary min-touch"; minus.textContent="-"; minus.setAttribute("aria-label","Decrease quantity");
      var qty = document.createElement("span"); qty.className="px-2 fw-medium"; qty.textContent=String(item.qty);
      var plus = document.createElement("button"); plus.type="button"; plus.className="btn btn-sm btn-outline-secondary min-touch"; plus.textContent="+"; plus.setAttribute("aria-label","Increase quantity");
      minus.addEventListener("click", function(){ ECMCart.updateQty(item.id, item.qty - 1, item.selections); renderOffcanvasCart(); if (typeof renderCartPage === "function") renderCartPage(); });
      plus.addEventListener("click", function(){ ECMCart.updateQty(item.id, item.qty + 1, item.selections); renderOffcanvasCart(); if (typeof renderCartPage === "function") renderCartPage(); });
      controls.appendChild(minus); controls.appendChild(qty); controls.appendChild(plus);
      content.appendChild(titleRow); content.appendChild(controls);
      top.appendChild(imgWrap); top.appendChild(content);
      row.appendChild(top);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    if (footer) {
      var sub = ECMCart.cartSubtotal();
      footer.innerHTML = sub === null
        ? 'Prices will be confirmed by the shop.'
        : ('<div class="d-flex justify-content-between align-items-center"><span class="fw-medium">Subtotal</span><span class="fw-bold fs-5">' + formatPeso(sub) + '</span></div>');
    }
  }

  function wireGlobalAddToCart() {
    document.addEventListener("click", function(e){
      var btn = e.target.closest("[data-add-to-cart]");
      if (!btn || !window.ECMCart) return;
      if (btn.disabled) return;
      var id = btn.getAttribute("data-add-to-cart");
      var needs = btn.getAttribute("data-needs-options");
      if (needs === "1") { window.location.href = "product.html?id=" + encodeURIComponent(id); return; }
      var qty = btn.getAttribute("data-qty") || 1;
      ECMCart.addToCart(id, qty);
      renderOffcanvasCart();
      pulseCartBadge();
      showToast("Added to cart");
    });
  }

  /* ========= Quick add modal (preserved) ========= */
  var quickAddState = { id: null };
  function ensureQuickAddModal() {
    if (document.getElementById("quickAddModal")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = '<div class="modal fade" id="quickAddModal" tabindex="-1" aria-labelledby="quickAddLabel" aria-hidden="true">'
      + '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">'
      + '<div class="modal-header"><h2 class="modal-title h5" id="quickAddLabel">Select options</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>'
      + '<div class="modal-body">'
      + '<div class="d-flex gap-3 align-items-start mb-3"><img id="qaImg" src="" alt="" class="rounded border placeholder-img" style="width:84px;height:84px;object-fit:cover"><div class="flex-grow-1"><div id="qaName" class="fw-semibold"></div><div id="qaMeta" class="small text-body-secondary"></div><div id="qaPrice" class="fw-semibold mt-1"></div><div id="qaVariant" class="small text-body-secondary"></div></div></div>'
      + '<div id="qaOptions"></div>'
      + '<div class="mt-3"><label for="qaQty" class="form-label">Quantity</label><input id="qaQty" type="number" class="form-control" value="1" min="1" style="max-width:140px"></div>'
      + '</div>'
      + '<div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" id="qaConfirm">Add to cart</button></div>'
      + '</div></div></div>';
    document.body.appendChild(wrap.firstChild);
    document.getElementById("qaConfirm").addEventListener("click", function(){
      var id = quickAddState.id;
      if (!id || !window.ECMCart || typeof getProductById !== "function") return;
      var p = getProductById(id);
      if (!p) return;
      var sel = {};
      document.querySelectorAll("#quickAddModal [data-qa-key]").forEach(function(el){ sel[el.getAttribute("data-qa-key")] = el.value; });
      var d = typeof resolveProduct === "function" ? resolveProduct(p, sel) : p;
      if (!d || !d.inStock) { showToast("This option is currently unavailable."); return; }
      var qty = parseInt(document.getElementById("qaQty").value, 10) || 1;
      ECMCart.addToCart(id, qty, sel);
      renderOffcanvasCart();
      pulseCartBadge();
      showToast("Added to cart");
      var modalEl = document.getElementById("quickAddModal");
      var inst = bootstrap.Modal.getInstance(modalEl);
      if (inst) inst.hide();
    });
  }
  function refreshQuickAdd() {
    var id = quickAddState.id;
    if (!id || typeof getProductById !== "function") return;
    var p = getProductById(id);
    if (!p) return;
    var sel = {};
    document.querySelectorAll("#quickAddModal [data-qa-key]").forEach(function(el){ sel[el.getAttribute("data-qa-key")] = el.value; });
    var d = typeof resolveProduct === "function" ? resolveProduct(p, sel) : p;
    var img = document.getElementById("qaImg");
    if (img) { img.src = d.image || p.image || ""; img.alt = p.name; }
    var name = document.getElementById("qaName"); if (name) name.textContent = p.name;
    var meta = document.getElementById("qaMeta"); if (meta) meta.textContent = (d.brand || p.brand) + " · " + p.category;
    var price = document.getElementById("qaPrice"); if (price) price.textContent = typeof formatPeso === "function" ? formatPeso(d.price) : (d.price == null ? "Ask for price" : d.price);
    var variant = document.getElementById("qaVariant"); if (variant) variant.textContent = d.variantLabel || d.size || "";
    var confirm = document.getElementById("qaConfirm");
    if (confirm) { confirm.disabled = !d.inStock; confirm.textContent = d.inStock ? "Add to cart" : "Coming soon"; }
  }
  function openQuickAdd(id) {
    if (typeof getProductById !== "function") { window.location.href = "product.html?id=" + encodeURIComponent(id); return; }
    var p = getProductById(id);
    if (!p) return;
    if (!(typeof productHasOptions === "function" && productHasOptions(p))) {
      if (window.ECMCart) { ECMCart.addToCart(id, 1); renderOffcanvasCart(); pulseCartBadge(); showToast("Added to cart"); }
      return;
    }
    ensureQuickAddModal();
    quickAddState.id = id;
    var optionsWrap = document.getElementById("qaOptions");
    optionsWrap.innerHTML = "";
    p.options.forEach(function(opt, idx){
      var group = document.createElement("div");
      group.className = idx < p.options.length - 1 ? "mb-3" : "";
      var label = document.createElement("label");
      label.className = "form-label mb-1";
      var selectId = "qa-opt-" + opt.key;
      label.setAttribute("for", selectId);
      label.textContent = opt.name;
      var select = document.createElement("select");
      select.className = "form-select";
      select.id = selectId;
      select.setAttribute("data-qa-key", opt.key);
      opt.choices.forEach(function(c){
        var o = document.createElement("option");
        o.value = c.value;
        o.textContent = c.label + (c.price !== undefined && c.price !== null && typeof formatPeso === "function" ? " — " + formatPeso(c.price) : "");
        select.appendChild(o);
      });
      select.addEventListener("change", refreshQuickAdd);
      group.appendChild(label); group.appendChild(select);
      optionsWrap.appendChild(group);
    });
    var qty = document.getElementById("qaQty"); if (qty) qty.value = "1";
    refreshQuickAdd();
    var modalEl = document.getElementById("quickAddModal");
    if (modalEl && window.bootstrap) new bootstrap.Modal(modalEl).show();
  }
  function wireQuickAdd() {
    document.addEventListener("click", function(e){
      var btn = e.target.closest("[data-quick-add]");
      if (!btn) return;
      if (btn.disabled) return;
      var id = btn.getAttribute("data-quick-add");
      if (!id) return;
      e.preventDefault();
      openQuickAdd(id);
    });
  }

  /* ========= Search suggestions ========= */
  function initSiteSearch() {
    var inputs = document.querySelectorAll("[data-site-search]");
    if (!inputs.length) return;
    inputs.forEach(function (input) {
      var wrap = input.closest(".site-search");
      if (!wrap) return;
      var panel = wrap.querySelector(".search-suggestions");
      if (!panel) {
        panel = document.createElement("div");
        panel.className = "search-suggestions";
        wrap.appendChild(panel);
      }
      function hide() { panel.classList.remove("show"); panel.innerHTML = ""; }
      function showResults(q) {
        q = (q || "").trim().toLowerCase();
        if (!q || typeof getProductsList !== "function") { hide(); return; }
        var list = getProductsList();
        var cats = {};
        var matches = [];
        list.forEach(function (p) {
          var hay = (p.name + " " + p.brand + " " + p.category).toLowerCase();
          if (hay.indexOf(q) !== -1) matches.push(p);
          if (p.category && p.category.toLowerCase().indexOf(q) !== -1) cats[p.category] = true;
        });
        matches = matches.slice(0, 6);
        var catNames = Object.keys(cats).slice(0, 3);
        panel.innerHTML = "";
        if (!matches.length && !catNames.length) { hide(); return; }
        catNames.forEach(function (c) {
          var a = document.createElement("a");
          a.href = "shop.html?category=" + encodeURIComponent(c);
          a.innerHTML = '<span class="sugg-cat">Category</span><div class="fw-semibold">' + c + '</div>';
          panel.appendChild(a);
        });
        matches.forEach(function (p) {
          var a = document.createElement("a");
          a.href = "product.html?id=" + encodeURIComponent(p.id);
          a.innerHTML = '<div class="fw-semibold">' + p.name + '</div><div class="small text-body-secondary">' + p.brand + ' · ' + p.category + '</div>';
          panel.appendChild(a);
        });
        var all = document.createElement("a");
        all.href = "shop.html?search=" + encodeURIComponent(q);
        all.innerHTML = '<span class="fw-semibold text-primary">Search all for “' + q.replace(/</g,"&lt;") + '”</span>';
        panel.appendChild(all);
        panel.classList.add("show");
      }
      input.addEventListener("input", function () { showResults(input.value); });
      input.addEventListener("focus", function () { if (input.value) showResults(input.value); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var first = panel.querySelector("a");
          if (first) { e.preventDefault(); window.location.href = first.getAttribute("href"); }
        }
        if (e.key === "Escape") hide();
      });
      document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) hide(); });
    });
  }

  /* ========= Back to top + reveal ========= */
  function initBackToTop() {
    if (document.querySelector(".back-to-top")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "?";
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
    document.body.appendChild(btn);
    var toggle = function () { if (window.scrollY > 400) btn.classList.add("show"); else btn.classList.remove("show"); };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("is-visible"); }); return;
    }
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ========= Validation & helpers ========= */
  function enableValidation() {
    document.querySelectorAll(".needs-validation").forEach(function(form){
      form.addEventListener("submit", function(event){
        if (!form.checkValidity()) { event.preventDefault(); event.stopPropagation(); }
        form.classList.add("was-validated");
      }, false);
    });
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function(){ fallbackCopy(text); });
    }
    fallbackCopy(text);
    return Promise.resolve();
  }
function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly",""); ta.style.position="absolute"; ta.style.left="-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch(e) {}
    document.body.removeChild(ta);
  }

  /* -------- Customer Sidebar (mobile < 1200px) -------- */
function initCustomerDrawer() {
    if (document.body.hasAttribute("data-admin-page")) return;
    if (document.body.classList.contains("admin-login-page")) return;
    if (typeof bootstrap === "undefined") return;

    var path = location.pathname.split("/").pop() || "index.html";

    var NAV_ITEMS = [
      { id: "home", label: "Home", icon: "bi-house", href: "index.html", match: ["index.html", ""] },
      { id: "shop", label: "Shop", icon: "bi-shop", href: "shop.html", match: ["shop.html"] },
      { id: "cart", label: "Cart", icon: "bi-cart3", href: "cart.html", match: ["cart.html"] },
      { id: "track", label: "Track Order", icon: "bi-truck", href: "track.html", match: ["track.html"] },
      { id: "quote", label: "Quote", icon: "bi-file-earmark-text", href: "quote.html", match: ["quote.html"] },
      { id: "howto", label: "How to Order", icon: "bi-question-circle", href: "how-to-order.html", match: ["how-to-order.html"] },
      { id: "about", label: "About", icon: "bi-info-circle", href: "about.html", match: ["about.html"] },
      { id: "contact", label: "Contact", icon: "bi-telephone", href: "contact.html", match: ["contact.html"] },
      { id: "feedback", label: "Feedback", icon: "bi-chat-square-heart", href: "feedback.html", match: ["feedback.html"] }
    ];

    var isActive = function(item) {
      return item.match.some(function(m) { return path === m || (m === "" && path === "index.html"); });
    };

    // Build drawer markup
    var drawer = document.createElement("nav");
    drawer.className = "offcanvas offcanvas-end";
    drawer.id = "customerDrawer";
    drawer.tabIndex = -1;
    drawer.setAttribute("aria-labelledby", "customerDrawerTitle");

    var navHtml = NAV_ITEMS.map(function(item) {
      var active = isActive(item) ? ' aria-current="page"' : '';
      var isShop = item.id === "shop";
      if (isShop) {
        return '<li class="customer-drawer-shop-wrap">' +
          '<a class="customer-drawer-nav-link customer-drawer-shop-toggle" data-nav="shop" href="shop.html" role="button" aria-expanded="false">' +
          '<i class="bi bi-shop" aria-hidden="true"></i>' +
          '<span class="customer-drawer-nav-label">Shop</span>' +
          '<i class="bi bi-chevron-down customer-drawer-shop-chevron" aria-hidden="true"></i>' +
          '</a>' +
          '<ul class="dropdown-menu customer-drawer-shop-menu">' +
          '<li><a class="dropdown-item" href="shop.html"><strong>All products</strong></a></li>' +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><a class="dropdown-item" href="shop.html?category=Construction%20materials">Construction materials <span class="small text-body-secondary d-block">Cement, steel, panels</span></a></li>' +
          '<li><a class="dropdown-item" href="shop.html?category=Water%20tanks">Water tanks <span class="small text-body-secondary d-block">Bestank & Firstank</span></a></li>' +
          '<li><a class="dropdown-item" href="shop.html?category=Power%20tools">Power tools <span class="small text-body-secondary d-block">Bosch drills, grinders, saws</span></a></li>' +
          '<li><a class="dropdown-item" href="shop.html?category=Hardware%20%26%20paint">Hardware & paint <span class="small text-body-secondary d-block">Plumbing, electrical, fasteners</span></a></li>' +
          '</ul>' +
          '</li>';
      } else {
        return '<li><a class="customer-drawer-nav-link" data-nav="' + item.id + '" href="' + item.href + '"' + active + '><i class="bi ' + item.icon + '" aria-hidden="true"></i><span class="customer-drawer-nav-label">' + item.label + '</span></a></li>';
      }
    }).join("");

    drawer.innerHTML = '' +
      '<div class="offcanvas-header">' +
        '<img src="images/logo.jpg" alt="" class="drawer-logo">' +
        '<span class="drawer-title">EC Marketing Corporation</span>' +
        '<button type="button" class="drawer-close" data-bs-dismiss="offcanvas" aria-label="Close menu">' +
          '<i class="bi bi-x" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<div class="offcanvas-body customer-drawer-body">' +
        '<ul class="customer-drawer-nav" role="list">' + navHtml + '</ul>' +
      '</div>' +
      '<div class="drawer-footer">' +
        '<div class="site-drawer-status">' +
          '<span class="status-pill status-open" id="customerDrawerStatusPill">Open now</span>' +
          '<span class="status-time small text-body-secondary" id="customerDrawerStatusTime">Opens Monday at 8:00 AM</span>' +
        '</div>' +
        '<div class="site-drawer-action-bar d-flex gap-2">' +
          '<a href="tel:+639171341638" class="btn btn-primary site-drawer-call flex-fill" aria-label="Call"><i class="bi bi-telephone" aria-hidden="true"></i><span class="site-drawer-action-label">Call</span></a>' +
          '<a href="sms:+639171341638" class="btn btn-outline-secondary site-drawer-text flex-fill" aria-label="Text"><i class="bi bi-chat-dots" aria-hidden="true"></i><span class="site-drawer-action-label">Text</span></a>' +
        '</div>' +
        '<button type="button" class="drawer-action customer-drawer-theme" data-theme-toggle data-theme-label aria-label="Toggle theme"><i class="bi bi-moon-stars" aria-hidden="true"></i><span class="drawer-action-label" data-theme-text>Dark</span></button>' +
      '</div>' +
    '';

    document.body.appendChild(drawer);

    var offcanvas = new bootstrap.Offcanvas(drawer, { backdrop: true, keyboard: true });
    var hamburger = document.querySelector(".btn-mobile-hamburger");
    if (!hamburger) return;

    var navLinks = drawer.querySelectorAll(".customer-drawer-nav-link");
    var shopToggle = drawer.querySelector(".customer-drawer-shop-toggle");
    var shopMenu = drawer.querySelector(".customer-drawer-shop-menu");
    var shopWrap = drawer.querySelector(".customer-drawer-shop-wrap");

    // Theme toggle sync
    var themeBtn = drawer.querySelector('[data-theme-toggle]');
    if (themeBtn) {
      var isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
      var icon = themeBtn.querySelector("i");
      var txt = themeBtn.querySelector("[data-theme-text]");
      if (icon) icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
      if (txt) txt.textContent = isDark ? "Light" : "Dark";
      themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    renderCustomerDrawerStatus();

    drawer.addEventListener("shown.bs.offcanvas", function () {
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.style.display = "none";
      document.body.style.overflow = "hidden";
      var first = drawer.querySelector('.customer-drawer-nav-link[aria-current="page"]') || drawer.querySelector(".customer-drawer-nav-link");
      if (first) first.focus();
    });

    drawer.addEventListener("hidden.bs.offcanvas", function () {
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.style.display = "";
      document.body.style.overflow = "";
      hamburger.focus();
      if (shopWrap) shopWrap.classList.remove("customer-drawer-shop-open");
      if (shopMenu) shopMenu.classList.remove("show");
      if (shopToggle) {
        shopToggle.setAttribute("aria-expanded", "false");
        var chev = shopToggle.querySelector(".customer-drawer-shop-chevron");
        if (chev) chev.style.transform = "";
      }
    });

    hamburger.addEventListener("click", function () {
      offcanvas.toggle();
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (link === shopToggle) return;
        offcanvas.hide();
      });
    });

    if (shopToggle && shopMenu && shopWrap) {
      shopToggle.addEventListener("click", function (e) {
        e.preventDefault();
        var expanded = shopWrap.classList.toggle("customer-drawer-shop-open");
        shopToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        shopMenu.classList.toggle("show", expanded);
        var chev = shopToggle.querySelector(".customer-drawer-shop-chevron");
        if (chev) chev.style.transform = expanded ? "rotate(180deg)" : "";
      });
      shopMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { offcanvas.hide(); });
      });
    }

    window.ECMCustomerDrawer = window.ECMCustomerDrawer || {};
    window.ECMCustomerDrawer.renderStatus = renderCustomerDrawerStatus;

    function renderCustomerDrawerStatus() {
      var pill = document.getElementById("customerDrawerStatusPill");
      var time = document.getElementById("customerDrawerStatusTime");
      if (!pill || !time) return;
      try {
        var now = new Date();
        var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        var ph = new Date(utc + (3600000 * 8));
        var day = ph.getDay();
        var mins = ph.getHours() * 60 + ph.getMinutes();
        var open = false;
        if (day >= 1 && day <= 5) open = mins >= 480 && mins < 1020;
        else if (day === 6) open = mins >= 480 && mins < 780;

        if (open) {
          pill.textContent = "Open now";
          pill.className = "status-pill status-open";
          var closeMins = (day >= 1 && day <= 5) ? 1020 : 780;
          time.textContent = "Closes " + formatPHTime(closeMins) + " today";
        } else {
          pill.textContent = "Closed now";
          pill.className = "status-pill status-closed";
          var nextDayLabel = (day === 0 || day === 6) ? "Monday" : "tomorrow";
          time.textContent = "Opens " + nextDayLabel + " at " + formatPHTime(480);
        }
      } catch (e) {
        pill.textContent = "Closed now";
        pill.className = "status-pill status-closed";
        time.textContent = "Hours: Mon–Fri 8–5, Sat 8–1";
      }
    }
    function formatPHTime(mins) {
      var h = Math.floor(mins / 60);
      var m = mins % 60;
      var ap = h >= 12 ? "PM" : "AM";
      var h12 = h % 12 || 12;
      return h12 + ":" + (m < 10 ? "0" : "") + m + " " + ap;
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    initTheme();
    initCustomerDrawer();
    setActiveNav();
    initShrinkNav();
    renderOpenNow();
    setInterval(renderOpenNow, 60000);
    enableValidation();
    wireGlobalAddToCart();
    wireQuickAdd();
    initSiteSearch();
    initBackToTop();
    initReveal();
    if (window.ECMCart) { ECMCart.updateCartBadge(); renderOffcanvasCart(); }
    var offcanvas = document.getElementById("cartOffcanvas");
    if (offcanvas) offcanvas.addEventListener("show.bs.offcanvas", renderOffcanvasCart);
    // Apply search query from URL to shop search if present
    try {
      var sp = new URLSearchParams(location.search);
      var q = sp.get("search");
      if (q && /shop\.html$/i.test(location.pathname)) {
        var d = document.getElementById("dSearch"), m = document.getElementById("mSearch");
        if (d) d.value = q;
        if (m) m.value = q;
      }
    } catch(e) {}
  });

  window.ECMUI = { showToast: showToast, renderOffcanvasCart: renderOffcanvasCart, copyText: copyText, pulseCartBadge: pulseCartBadge };
})();
