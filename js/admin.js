/* EC Marketing Corporation - Staff Portal */
(function () {
  "use strict";

  var ECM_ADMIN_CREDENTIALS = { username: "admin", password: "ecm2026" };
  var ECM_ADMIN_SESSION_KEY = "ecm_admin_auth";
  var ORDER_STATUSES = [
    "New",
    "Confirmed (price and availability confirmed)",
    "Paid",
    "COD arranged",
    "Out for delivery",
    "Delivered",
    "Cancelled"
  ];

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.from((r || document).querySelectorAll(s)); }
  function esc(v) { return String(v == null ? "" : v); }
  function setText(el, t) { if (el) el.textContent = (t == null ? "" : String(t)); }

  function isAuthed() {
    try { return sessionStorage.getItem(ECM_ADMIN_SESSION_KEY) === "1"; } catch (e) { return false; }
  }
  function requireAuth() {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "login.html") {
      if (isAuthed()) location.href = "dashboard.html";
      return;
    }
    if (!isAuthed()) location.href = "login.html";
  }
  function login(u, p) {
    if (u === ECM_ADMIN_CREDENTIALS.username && p === ECM_ADMIN_CREDENTIALS.password) {
      try { sessionStorage.setItem(ECM_ADMIN_SESSION_KEY, "1"); } catch (e) {}
      return true;
    }
    return false;
  }
  function logout() {
    try { sessionStorage.removeItem(ECM_ADMIN_SESSION_KEY); } catch (e) {}
    location.href = "login.html";
  }

  function toast(msg) {
    if (window.ECMUI && ECMUI.showToast) { ECMUI.showToast(msg); return; }
    var c = qs("#toastContainer");
    if (!c) return;
    var el = document.createElement("div");
    el.className = "toast align-items-center text-bg-dark border-0";
    el.setAttribute("role", "status");
    el.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
    var body = el.querySelector(".toast-body");
    if (body) body.textContent = msg;
    c.appendChild(el);
    var t = new bootstrap.Toast(el, { delay: 2500 });
    el.addEventListener("hidden.bs.toast", function () { el.remove(); });
    t.show();
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleString(); } catch (e) { return String(iso); }
  }
  function peso(v) {
    if (typeof formatPeso === "function") return formatPeso(v);
    return (v == null || v === "" || isNaN(v)) ? "Ask for price" : "₱" + Number(v).toFixed(2);
  }
  function setBadge(el, s) {
    if (!el) return;
    var map = {
      "New": "text-bg-primary",
      "Confirmed (price and availability confirmed)": "text-bg-info",
      "Paid": "text-bg-success",
      "COD arranged": "text-bg-warning",
      "Out for delivery": "text-bg-warning",
      "Delivered": "text-bg-success",
      "Cancelled": "text-bg-secondary"
    };
    el.className = "badge " + (map[s] || "text-bg-secondary");
    el.textContent = s || "New";
  }

  function updateNewOrdersBadge(){
    var n = 0;
    try { n = orders().filter(function(o){return (o.status||"New")==="New";}).length; } catch(e){}
    qsa("#adminNewOrdersBadge, .adminNewOrdersBadge").forEach(function(b){
      b.textContent = String(n);
      b.classList.toggle("d-none", n===0);
    });
    var link = qs('[data-nav="orders"]');
    if(link){ link.setAttribute("aria-label", "Orders" + (n ? ", " + n + " new" : "")); }
    var drawerLink = document.querySelector('#adminDrawer .admin-drawer-nav-link[data-nav="orders"]');
    if(drawerLink){ drawerLink.setAttribute("aria-label", "Orders" + (n ? ", " + n + " new" : "")); }
  }
  function initShell(active) {
    updateNewOrdersBadge();
    qsa("[data-admin-nav]").forEach(function (a) {
      if (a.getAttribute("data-admin-nav") === active) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });
    var lb = qs("#adminLogout");
    if (lb) lb.addEventListener("click", function (e) { e.preventDefault(); logout(); });
    var y = qs("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  function products() { try { return ECMStore.getProducts(); } catch (e) { return []; } }
  function orders() { try { return ECMStore.getOrders(); } catch (e) { return []; } }
  function inquiries() { try { return ECMStore.getInquiries(); } catch (e) { return []; } }
  function quotes() { try { return ECMStore.getQuotes(); } catch (e) { return []; } }
  function feedback() { try { return ECMStore.getFeedback(); } catch (e) { return []; } }
  function saveRecord(kind, rec) { try { return ECMStore.saveRecord(kind, rec); } catch (e) { return rec; } }

  function stockStatusOf(p) {
    if (p && p.stockStatus) return p.stockStatus;
    return (p && p.inStock === false) ? "Out of stock" : "In stock";
  }

  /* -------- Login -------- */
  function initLogin() {
    initShell("login");
    var form = qs("#loginForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.add("was-validated");
      var u = (qs("#username") && qs("#username").value || "").trim();
      var p = (qs("#password") && qs("#password").value || "");
      if (!u || !p) return;
      if (login(u, p)) {
        location.href = "dashboard.html";
      } else {
        var err = qs("#loginError");
        if (err) { err.classList.remove("d-none"); err.textContent = "Invalid username or password."; }
      }
    });
  }

  /* -------- Dashboard -------- */
  function initDashboard() {
    initShell("dashboard");
    var prods = products(), ords = orders(), inqs = inquiries(), qts = quotes(), fbs = feedback();
    var newOrdersList = ords.filter(function (o) { return (o.status || "New") === "New"; });
    var newOrders = newOrdersList.length;
    var lowOut = prods.filter(function (p) {
      var st = stockStatusOf(p);
      return st === "Out of stock" || st === "Low stock";
    }).length;
    var pendingInquiries = inqs.filter(function (i) { return !(i.replied || i.status === "Replied"); }).length;
    var pendingQuotes = qts.filter(function (q) { return !(q.replied || q.status === "Replied"); }).length;
    var avg = 0;
    if (fbs.length) avg = fbs.reduce(function (s, f) { return s + (Number(f.rating) || 0); }, 0) / fbs.length;

    // Update KPI values
    setText(qs("#kpiOrders"), ords.length);
    setText(qs("#kpiNewOrders"), newOrders);
    setText(qs("#kpiInquiries"), inqs.length);
    setText(qs("#kpiQuotes"), qts.length);
    setText(qs("#kpiLowStock"), lowOut);

    // Rating value and stars
    var ratingEl = qs("#kpiRating");
    var starsEl = qs("#kpiStars");
    var ratingHelperEl = qs("#kpiRatingHelper");
    if (fbs.length) {
      var ratingStr = (Math.round(avg * 10) / 10).toFixed(1) + " / 5";
      setText(ratingEl, ratingStr);
      // Generate star icons
      var fullStars = Math.round(avg);
      var starsHtml = "";
      for (var i = 1; i <= 5; i++) {
        starsHtml += '<i class="bi ' + (i <= fullStars ? 'bi-star-fill' : 'bi-star') + '"></i>';
      }
      starsEl.innerHTML = starsHtml;
      setText(ratingHelperEl, "From " + fbs.length + " responses");
    } else {
      setText(ratingEl, "No feedback yet");
      starsEl.innerHTML = "";
      setText(ratingHelperEl, "");
    }

    // Inquiries helper text
    var inqHelperEl = qs("#kpiInquiriesHelper");
    if (inqHelperEl) {
      if (pendingInquiries === 1) {
        setText(inqHelperEl, "1 pending reply");
      } else {
        setText(inqHelperEl, pendingInquiries + " pending replies");
      }
    }

    // Quotes helper text
    var quotesHelperEl = qs("#kpiQuotesHelper");
    if (quotesHelperEl) {
      if (pendingQuotes === 1) {
        setText(quotesHelperEl, "1 pending reply");
      } else {
        setText(quotesHelperEl, pendingQuotes + " pending replies");
      }
    }

    // Low stock helper text
    var lowStockHelperEl = qs("#kpiLowStockHelper");
    if (lowStockHelperEl) {
      if (lowOut === 0) {
        setText(lowStockHelperEl, "All items in stock");
      } else {
        setText(lowStockHelperEl, "Needs restock");
      }
    }

    // Action states for New orders and Low stock cards
    var newOrdersCard = qs("#kpiNewOrdersCard");
    if (newOrdersCard) {
      if (newOrders > 0) newOrdersCard.classList.add("kpi-has-action");
      else newOrdersCard.classList.remove("kpi-has-action");
    }
    var lowStockCard = qs("#kpiLowStockCard");
    if (lowStockCard) {
      if (lowOut > 0) lowStockCard.classList.add("kpi-has-action");
      else lowStockCard.classList.remove("kpi-has-action");
    }

    // Update aria-labels
    var totalCard = qs("#kpiTotalOrdersCard");
    if (totalCard) totalCard.setAttribute("aria-label", "Total orders: " + ords.length + ". Open all orders.");
    var newOrdersCardLabel = qs("#kpiNewOrdersCard");
    if (newOrdersCardLabel) newOrdersCardLabel.setAttribute("aria-label", "New orders: " + newOrders + ". Open the orders list filtered to new orders.");
    var inqCard = qs("#kpiInquiriesCard");
    if (inqCard) inqCard.setAttribute("aria-label", "Online inquiries: " + inqs.length + ". Open all inquiries.");
    var quotesCard = qs("#kpiQuotesCard");
    if (quotesCard) quotesCard.setAttribute("aria-label", "Bulk quote requests: " + qts.length + ". Open the bulk quotes tab.");
    var ratingCard = qs("#kpiRatingCard");
    if (ratingCard) {
      var ratingLabel = fbs.length ? ((Math.round(avg * 10) / 10).toFixed(1) + " / 5") : "No feedback yet";
      ratingCard.setAttribute("aria-label", "Average feedback rating: " + ratingLabel + ". Open feedback.");
    }
    var lowStockCardLabel = qs("#kpiLowStockCard");
    if (lowStockCardLabel) lowStockCardLabel.setAttribute("aria-label", "Low or out of stock items: " + lowOut + ". Open products filtered to low stock.");

    var alertEl = qs("#newOrdersAlert");
    if (alertEl) {
      var lastSeen = 0;
      try { lastSeen = parseInt(localStorage.getItem("ecm_admin_orders_seen")||"0",10) || 0; } catch(e){}
      var since = newOrdersList.filter(function(o){ var t = Date.parse(o.timestamp||""); return t && t > lastSeen; });
      alertEl.innerHTML = "";
      if (since.length) {
        alertEl.className = "alert alert-warning border-warning";
        var h = document.createElement("div"); h.className = "fw-semibold mb-1"; h.textContent = since.length + " new order(s) placed since you last opened Orders"; alertEl.appendChild(h);
        var ul = document.createElement("ul"); ul.className = "mb-0 ps-3";
        since.slice(0,8).forEach(function(o){
          var li = document.createElement("li"); li.textContent = (o.ref||o.id||"") + " — " + ((o.customer&&o.customer.name)||"Customer") + " (" + fmtDate(o.timestamp) + ")"; ul.appendChild(li);
        });
        alertEl.appendChild(ul);
      } else if (newOrders > 0) {
        alertEl.className = "alert alert-info mb-4"; alertEl.textContent = newOrders + " order(s) currently awaiting confirmation (status: New). Open Orders to review.";
      } else {
        alertEl.className = "d-none"; alertEl.textContent = "";
      }
    }

    var tbody = qs("#recentOrdersBody");
    if (tbody) {
      tbody.innerHTML = "";
      var recent = ords.slice(0, 3);
      if (!recent.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-body-secondary">No orders yet.</td></tr>';
      } else {
        recent.forEach(function (o) {
          var tr = document.createElement("tr");
          var itemsCount = Array.isArray(o.items) ? o.items.reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0) : 0;
var tdRef = document.createElement("td");
        var refTxt = document.createElement("span"); refTxt.textContent = o.ref || o.id || ""; tdRef.appendChild(refTxt);
        var tdCust = document.createElement("td"); tdCust.textContent = (o.customer && o.customer.name) || "";
          var tdItems = document.createElement("td"); tdItems.textContent = itemsCount + " item(s)";
          var tdStatus = document.createElement("td"); var b = document.createElement("span"); setBadge(b, o.status || "New"); tdStatus.appendChild(b);
          var tdDate = document.createElement("td"); tdDate.textContent = fmtDate(o.timestamp);
          tr.appendChild(tdRef); tr.appendChild(tdCust); tr.appendChild(tdItems); tr.appendChild(tdStatus); tr.appendChild(tdDate);
          tbody.appendChild(tr);
        });
      }
    }

    var oos = qs("#oosList");
    if (oos) {
      oos.innerHTML = "";
      var list = prods.filter(function (p) { return stockStatusOf(p) === "Out of stock"; });
      if (!list.length) {
        var li0 = document.createElement("li"); li0.className = "list-group-item text-body-secondary"; li0.textContent = "No out-of-stock products."; oos.appendChild(li0);
      } else {
        list.forEach(function (p) {
          var li = document.createElement("li"); li.className = "list-group-item d-flex justify-content-between align-items-center";
          var n = document.createElement("span"); n.textContent = p.name || "";
          var b = document.createElement("span"); b.className = "badge text-bg-secondary"; b.textContent = "Out of stock";
          li.appendChild(n); li.appendChild(b); oos.appendChild(li);
        });
      }
    }

    function renderBars(containerId, counts, total) {
      var c = qs(containerId); if (!c) return; c.innerHTML = "";
      var keys = Object.keys(counts);
      if (!total) { c.innerHTML = '<p class="text-body-secondary small mb-0">No data yet.</p>'; return; }
      keys.forEach(function (k) {
        var v = counts[k] || 0, pct = total ? Math.round((v / total) * 100) : 0;
        var row = document.createElement("div"); row.className = "mb-2";
        var head = document.createElement("div"); head.className = "d-flex justify-content-between small";
        var l = document.createElement("span"); l.textContent = k;
        var r = document.createElement("span"); r.textContent = v + " (" + pct + "%)";
        head.appendChild(l); head.appendChild(r);
        var prog = document.createElement("div"); prog.className = "progress"; prog.setAttribute("role", "progressbar");
        prog.setAttribute("aria-valuemin", "0"); prog.setAttribute("aria-valuemax", "100"); prog.setAttribute("aria-valuenow", String(pct));
        var bar = document.createElement("div"); bar.className = "progress-bar"; bar.style.width = pct + "%";
        prog.appendChild(bar); row.appendChild(head); row.appendChild(prog); c.appendChild(row);
      });
    }

    var byStatus = {}; ORDER_STATUSES.forEach(function (s) { byStatus[s] = 0; });
    ords.forEach(function (o) { var s = o.status || "New"; if (byStatus[s] == null) byStatus[s] = 0; byStatus[s]++; });
    renderBars("#ordersByStatus", byStatus, ords.length);

    var byType = {};
    ords.forEach(function (o) { var t = (o.customer && o.customer.customerType) || "Unknown"; byType[t] = (byType[t] || 0) + 1; });
    renderBars("#ordersByType", byType, ords.length);

    var salesCount = 0, salesValue = 0, hasAnyPrice = false;
    ords.forEach(function (o) {
      salesCount++;
      if (typeof o.subtotal === "number" && !isNaN(o.subtotal)) { salesValue += o.subtotal; hasAnyPrice = true; }
    });
    var repeats = 0, byMobile = {};
    ords.forEach(function (o) { var m = (o.customer && o.customer.mobile) || ""; if (!m) return; byMobile[m] = (byMobile[m] || 0) + 1; });
    Object.keys(byMobile).forEach(function (m) { if (byMobile[m] > 1) repeats++; });

    var kpiPanel = qs("#kpiPlanPanel");
    if (kpiPanel) {
      kpiPanel.innerHTML = "";
      var rows = [
        ["Sales (orders count)", String(salesCount)],
        ["Sales value (when prices exist)", hasAnyPrice ? peso(salesValue) : "Prices to be confirmed"],
        ["Online inquiries", String(inqs.length)],
        ["Online orders", String(ords.length)],
        ["Customer feedback", String(fbs.length) + (fbs.length ? (" (avg " + (Math.round(avg * 10) / 10) + "/5)") : "")],
        ["Repeat purchases (customers with >1 order, by mobile)", String(repeats)]
      ];
      var ul = document.createElement("ul"); ul.className = "list-group list-group-flush";
      rows.forEach(function (r) {
        var li = document.createElement("li"); li.className = "list-group-item d-flex justify-content-between align-items-start gap-2";
        var a = document.createElement("span"); a.textContent = r[0];
        var b = document.createElement("span"); b.className = "fw-semibold text-end"; b.textContent = r[1];
        li.appendChild(a); li.appendChild(b); ul.appendChild(li);
      });
      kpiPanel.appendChild(ul);
    }

    // Render charts
    renderCharts(ords, byStatus, byType);
  }

  function renderCharts(ords, byStatus, byType) {
    if (typeof Chart === "undefined") return;

    // Orders trend (last 7 days)
    var ordersCtx = qs("#ordersChart");
    if (ordersCtx) {
      var days = [];
      var counts = [];
      for (var i = 6; i >= 0; i--) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var key = d.toISOString().split("T")[0];
        days.push(d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }));
        var c = 0;
        ords.forEach(function(o){
          var od = new Date(o.timestamp).toISOString().split("T")[0];
          if (od === key) c++;
        });
        counts.push(c);
      }
      new Chart(ordersCtx, {
        type: "line",
        data: { labels: days, datasets: [{ label: "Orders", data: counts, borderColor: "#D61F1F", backgroundColor: "rgba(214,31,31,0.1)", fill: true, tension: 0.3, pointBackgroundColor: "#D61F1F", pointBorderColor: "#fff", pointRadius: 4, pointHoverRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { stepSize: 1 } } } }
      });
    }

    // Orders by status (doughnut)
    var statusCtx = qs("#statusChart");
    if (statusCtx) {
      var statusLabels = Object.keys(byStatus).filter(function(k){ return byStatus[k] > 0; });
      var statusData = statusLabels.map(function(k){ return byStatus[k]; });
      var statusColors = ["#D61F1F", "#0dcaf0", "#F5B400", "#F5B400", "#198754", "#6c757d"];
      new Chart(statusCtx, {
        type: "doughnut",
        data: { labels: statusLabels, datasets: [{ data: statusData, backgroundColor: statusColors.slice(0, statusLabels.length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }, tooltip: { callbacks: { label: function(ctx){ return ctx.label + ": " + ctx.parsed; } } } }, cutout: "65%" }
      });
    }

    // Orders by customer type (doughnut)
    var typeCtx = qs("#typeChart");
    if (typeCtx) {
      var typeLabels = Object.keys(byType).filter(function(k){ return byType[k] > 0; });
      var typeData = typeLabels.map(function(k){ return byType[k]; });
      var typeColors = ["#D61F1F", "#F5B400", "#0dcaf0", "#198754", "#6f42c1", "#fd7e14"];
      new Chart(typeCtx, {
        type: "doughnut",
        data: { labels: typeLabels, datasets: [{ data: typeData, backgroundColor: typeColors.slice(0, typeLabels.length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }, tooltip: { callbacks: { label: function(ctx){ return ctx.label + ": " + ctx.parsed; } } } }, cutout: "65%" }
      });
    }
  }

  /* -------- Products -------- */
  function initProducts() {
    initShell("products");
    var tbody = qs("#productsBody"), search = qs("#prodSearch"), cat = qs("#prodCategory");
    var modalEl = qs("#productModal"), form = qs("#productForm");
    if (!tbody || !form) return;

    // Handle ?stock=low query parameter
    var urlParams = new URLSearchParams(window.location.search);
    var stockParam = urlParams.get("stock");
    if (stockParam === "low") {
      // We'll handle this in the render function by adding a stock filter
    }

    // Fix aria-hidden accessibility issue on modal
    if (modalEl) {
      modalEl.addEventListener('show.bs.modal', function () {
        modalEl.setAttribute('aria-hidden', 'false');
      });
      modalEl.addEventListener('hidden.bs.modal', function () {
        modalEl.setAttribute('aria-hidden', 'true');
      });
    }

    function categories() {
      var set = {};
      products().forEach(function (p) { if (p.category) set[p.category] = 1; });
      return Object.keys(set).sort();
    }
    function refreshCats() {
      if (!cat) return;
      var cur = cat.value;
      cat.innerHTML = '<option value="">All categories</option>';
      categories().forEach(function (c) {
        var o = document.createElement("option"); o.value = c; o.textContent = c; cat.appendChild(o);
      });
      cat.value = cur;
    }
function render() {
      refreshCats();
      var q = ((search && search.value) || "").toLowerCase();
      var cf = (cat && cat.value) || "";
      var urlParams = new URLSearchParams(window.location.search);
      var stockParam = urlParams.get("stock");
      var list = products().filter(function (p) {
        var hay = (esc(p.name) + " " + esc(p.brand) + " " + esc(p.category) + " " + esc(p.id)).toLowerCase();
        var stockMatch = true;
        if (stockParam === "low") {
          var st = stockStatusOf(p);
          stockMatch = (st === "Out of stock" || st === "Low stock");
        }
        return (!q || hay.indexOf(q) !== -1) && (!cf || p.category === cf) && stockMatch;
      });
      tbody.innerHTML = "";
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-body-secondary">No products found.</td></tr>';
        return;
      }
      list.forEach(function (p) {
        var st = stockStatusOf(p);
        var tr = document.createElement("tr");
        tr.style.height = "72px";
        
        // Product column (min 260px, flexible)
        var tdInfo = document.createElement("td");
        tdInfo.className = "col-product";
        tdInfo.style.padding = ".75rem 1rem";
        tdInfo.style.verticalAlign = "middle";
        tdInfo.style.overflow = "hidden";
        
        var imgPath = p.image;
        if (imgPath && !imgPath.startsWith("data:") && !imgPath.startsWith("http") && !imgPath.startsWith("../")) {
          imgPath = "../" + imgPath;
        }
        
        var productWrap = document.createElement("div");
        productWrap.className = "d-flex align-items-center gap-3";
        productWrap.style.minWidth = "0";
        
        var img = document.createElement("img");
        img.src = imgPath || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect fill='%23e9ecef' width='56' height='56' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-size='10' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";
        img.alt = p.name || "";
        img.style.width = "56px";
        img.style.height = "56px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid var(--bs-border-color)";
        img.style.flex = "0 0 56px";
        productWrap.appendChild(img);
        
        var textWrap = document.createElement("div");
        textWrap.style.minWidth = "0";
        textWrap.style.flex = "1";
        
        var nm = document.createElement("div");
        nm.className = "fw-semibold text-truncate";
        nm.style.lineHeight = "1.3";
        nm.textContent = p.name || "";
        nm.title = p.name || "";
        textWrap.appendChild(nm);
        
        var meta = document.createElement("div");
        meta.className = "small text-body-secondary text-truncate";
        meta.style.lineHeight = "1.3";
        var metaText = (p.brand || "") + (p.size ? " · " + p.size : "");
        meta.textContent = metaText;
        meta.title = metaText;
        textWrap.appendChild(meta);
        
        productWrap.appendChild(textWrap);
        tdInfo.appendChild(productWrap);
        
        // Category column (min 170px)
        var tdCat = document.createElement("td");
        tdCat.className = "col-category d-none d-lg-table-cell";
        tdCat.style.padding = ".75rem 1rem";
        tdCat.style.verticalAlign = "middle";
        tdCat.style.whiteSpace = "nowrap";
        tdCat.textContent = p.category || "";
        
        // Brand column (min 120px) - show "TBA" for "To be announced"
        var tdBrand = document.createElement("td");
        tdBrand.className = "col-brand d-none d-lg-table-cell";
        tdBrand.style.padding = ".75rem 1rem";
        tdBrand.style.verticalAlign = "middle";
        tdBrand.style.whiteSpace = "nowrap";
        var brandText = p.brand || "—";
        if (brandText === "To be announced") {
          tdBrand.textContent = "TBA";
          tdBrand.title = "To be announced";
        } else {
          tdBrand.textContent = brandText;
        }
        
        // Price column (min 120px, right-aligned)
        var tdPrice = document.createElement("td");
        tdPrice.className = "col-price text-end";
        tdPrice.style.padding = ".75rem 1rem";
        tdPrice.style.verticalAlign = "middle";
        tdPrice.style.whiteSpace = "nowrap";
        tdPrice.style.fontVariantNumeric = "tabular-nums";
        tdPrice.style.paddingRight = "1.25rem";
        if (p.price == null || p.price === "") {
          tdPrice.innerHTML = '<span class="text-body-secondary small">Ask for price</span>';
        } else {
          tdPrice.textContent = peso(p.price);
        }
        
        // Stock column (min 120px, centered pill)
        var tdStock = document.createElement("td");
        tdStock.className = "col-stock";
        tdStock.style.padding = ".75rem 1rem";
        tdStock.style.verticalAlign = "middle";
        tdStock.style.whiteSpace = "nowrap";
        tdStock.style.textAlign = "center";
        var stockIconMap = {
          "In stock": "bi-check-circle-fill text-success",
          "Low stock": "bi-exclamation-triangle-fill text-warning",
          "Out of stock": "bi-x-circle-fill text-danger"
        };
        var stockBadge = document.createElement("span");
        stockBadge.className = "badge d-inline-flex align-items-center gap-1 px-2 py-1";
        stockBadge.style.fontSize = ".75rem";
        stockBadge.style.borderRadius = "var(--radius-pill)";
        if (st === "In stock") {
          stockBadge.classList.add("bg-success-subtle", "text-success");
        } else if (st === "Low stock") {
          stockBadge.classList.add("bg-warning-subtle", "text-warning");
        } else {
          stockBadge.classList.add("bg-danger-subtle", "text-danger");
        }
        stockBadge.innerHTML = '<i class="bi ' + stockIconMap[st] + '"></i>' + esc(st);
        tdStock.appendChild(stockBadge);
        
        // Badge column (min 130px) - show only first badge as pill
        var tdBadge = document.createElement("td");
        tdBadge.className = "col-badge d-none d-lg-table-cell";
        tdBadge.style.padding = ".75rem 1rem";
        tdBadge.style.verticalAlign = "middle";
        tdBadge.style.whiteSpace = "nowrap";
        tdBadge.style.textAlign = "center";
        var badge = p.badge;
        if (!badge || badge === "None") {
          tdBadge.innerHTML = '<span class="text-body-secondary">—</span>';
        } else {
          // Take only first badge if multiple (e.g., "New / Coming soon" -> "New")
          var firstBadge = badge.split("/")[0].trim();
          var nb = document.createElement("span");
          nb.className = "badge";
          nb.style.fontSize = ".65rem";
          if (firstBadge === "New") {
            nb.style.background = "var(--ecm-red)";
            nb.style.color = "#fff";
          } else if (firstBadge === "Coming soon") {
            nb.style.background = "var(--ecm-gold)";
            nb.style.color = "var(--ecm-charcoal)";
          } else {
            nb.style.background = "var(--ecm-gold)";
            nb.style.color = "var(--ecm-charcoal)";
          }
          nb.textContent = firstBadge;
          tdBadge.appendChild(nb);
        }
        
        // Quick stock column (min 170px, button fits inside)
        var tdToggle = document.createElement("td");
        tdToggle.className = "col-toggle d-none d-md-table-cell";
        tdToggle.style.padding = ".75rem 1rem";
        tdToggle.style.verticalAlign = "middle";
        tdToggle.style.whiteSpace = "nowrap";
        var tog = document.createElement("button"); 
        tog.type = "button";
        tog.style.height = "32px";
        tog.style.width = "100%";
        tog.style.maxWidth = "150px";
        tog.style.whiteSpace = "nowrap";
        tog.style.fontSize = ".85rem";
        tog.style.padding = ".3rem .6rem";
        if (st === "Out of stock") {
          tog.className = "btn btn-sm btn-outline-success d-flex align-items-center justify-content-center gap-1";
          tog.innerHTML = '<i class="bi bi-check-circle"></i> Mark in stock';
          tog.style.borderColor = "#1E7A46";
          tog.style.color = "#1E7A46";
        } else {
          tog.className = "btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1";
          tog.innerHTML = '<i class="bi bi-slash-circle"></i> Mark out of stock';
        }
        tog.addEventListener("click", function () {
          var pp = Object.assign({}, p);
          var cur = stockStatusOf(pp);
          if (cur === "Out of stock") { pp.inStock = true; pp.stockStatus = "In stock"; }
          else { pp.inStock = false; pp.stockStatus = "Out of stock"; }
          ECMStore.saveProduct(pp);
          toast("Stock updated");
          render();
        });
        tdToggle.appendChild(tog);
        
        // Actions column (120px, right-aligned, icon-only square buttons)
        var tdAct = document.createElement("td");
        tdAct.className = "col-action text-end";
        tdAct.style.padding = ".75rem 1rem";
        tdAct.style.verticalAlign = "middle";
        tdAct.style.width = "120px";
        tdAct.style.paddingLeft = "1rem";
        
        var actionWrap = document.createElement("div");
        actionWrap.className = "d-flex gap-2 justify-content-end flex-nowrap";
        
        var eb = document.createElement("button"); 
        eb.type = "button";
        eb.className = "btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center";
        eb.style.width = "34px";
        eb.style.height = "34px";
        eb.setAttribute("aria-label", "Edit product " + (p.name || p.id));
        eb.title = "Edit";
        eb.innerHTML = '<i class="bi bi-pencil"></i>';
        eb.addEventListener("click", function () { openModal(p); });
        
        var db = document.createElement("button"); 
        db.type = "button";
        db.className = "btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center";
        db.style.width = "34px";
        db.style.height = "34px";
        db.setAttribute("aria-label", "Delete product " + (p.name || p.id));
        db.title = "Delete";
        db.innerHTML = '<i class="bi bi-trash"></i>';
        db.addEventListener("click", function () {
          if (confirm("Delete this product?")) { ECMStore.deleteProduct(p.id); toast("Product deleted"); render(); }
        });
        
        actionWrap.appendChild(eb); 
        actionWrap.appendChild(db);
        tdAct.appendChild(actionWrap);
        
        tr.appendChild(tdInfo);
        tr.appendChild(tdCat);
        tr.appendChild(tdBrand);
        tr.appendChild(tdPrice);
        tr.appendChild(tdStock);
        tr.appendChild(tdBadge);
        tr.appendChild(tdToggle);
        tr.appendChild(tdAct);
        tbody.appendChild(tr);
      });
    }

    function openModal(p) {
      form.reset();
      form.classList.remove("was-validated");
      setText(qs("#pmTitle"), p ? "Edit product" : "Add product");
      qs("#pmId").value = p ? (p.id || "") : "";
      qs("#pmName").value = p ? (p.name || "") : "";
      qs("#pmBrand").value = p ? (p.brand || "") : "";
      qs("#pmCategory").value = p ? (p.category || "") : "";
      qs("#pmSize").value = p ? (p.size || "") : "";
      qs("#pmDesc").value = p ? (p.description || "") : "";
      qs("#pmPrice").value = (p && p.price != null && p.price !== "") ? p.price : "";
      qs("#pmStock").value = p ? stockStatusOf(p) : "In stock";
      qs("#pmBadge").value = p ? (p.badge || "None") : "None";
      qs("#pmAudience").value = p && Array.isArray(p.audience) ? p.audience.join(", ") : "";
      qs("#pmImage").value = p ? (p.image || "") : "";
      
      // Handle image preview
      var previewContainer = qs("#pmImagePreview");
      var previewImg = qs("#pmImagePreviewImg");
      var imageValue = p ? (p.image || "") : "";
      if (previewContainer && previewImg) {
        if (imageValue && (imageValue.startsWith("data:") || imageValue.startsWith("http"))) {
          previewImg.src = imageValue;
          previewContainer.classList.remove("d-none");
        } else if (imageValue && imageValue.startsWith("images/")) {
          previewImg.src = "../" + imageValue;
          previewContainer.classList.remove("d-none");
        } else if (imageValue && imageValue.startsWith("../images/")) {
          previewImg.src = imageValue;
          previewContainer.classList.remove("d-none");
        } else {
          previewContainer.classList.add("d-none");
          previewImg.src = "";
        }
      }
      
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    // Image file upload handler
    var imageFileInput = qs("#pmImageFile");
    var imageHiddenInput = qs("#pmImage");
    var previewContainer = qs("#pmImagePreview");
    var previewImg = qs("#pmImagePreviewImg");
    if (imageFileInput) {
      imageFileInput.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          toast("Please select an image file");
          imageFileInput.value = "";
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          toast("Image too large (max 2MB)");
          imageFileInput.value = "";
          return;
        }
        var reader = new FileReader();
        reader.onload = function (evt) {
          var dataUrl = evt.target.result;
          imageHiddenInput.value = dataUrl;
          previewImg.src = dataUrl;
          previewContainer.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
      });
    }

    if (search) search.addEventListener("input", render);
    if (cat) cat.addEventListener("change", render);
    var addBtn = qs("#addProductBtn");
    if (addBtn) addBtn.addEventListener("click", function () { openModal(null); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
      var id = (qs("#pmId").value || "").trim();
      var existing = id ? products().find(function (x) { return x.id === id; }) : null;
      var stock = qs("#pmStock").value;
      var priceRaw = (qs("#pmPrice").value || "").trim();
      var aud = (qs("#pmAudience").value || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      var prod = Object.assign({}, existing || {}, {
        id: id || ("prod-" + Date.now().toString(36)),
        name: (qs("#pmName").value || "").trim(),
        brand: (qs("#pmBrand").value || "").trim(),
        category: (qs("#pmCategory").value || "").trim(),
        size: (qs("#pmSize").value || "").trim(),
        description: (qs("#pmDesc").value || "").trim(),
        price: priceRaw === "" ? null : Number(priceRaw),
        image: (qs("#pmImage").value || "").trim() || (existing && existing.image) || "images/placeholder-hardware.jpg",
        badge: (qs("#pmBadge").value === "None" ? "" : qs("#pmBadge").value),
        inStock: stock !== "Out of stock",
        stockStatus: stock,
        audience: aud.length ? aud : ((existing && existing.audience) || ["Homeowners"])
      });
      ECMStore.saveProduct(prod);
      bootstrap.Modal.getInstance(modalEl).hide();
      toast(existing ? "Product updated" : "Product added");
      render();
    });
    render();
  }

  /* -------- Orders -------- */
  function initOrders() {
    initShell("orders");
    try { localStorage.setItem("ecm_admin_orders_seen", String(Date.now())); } catch(e){}
    updateNewOrdersBadge();
    var tbody = qs("#ordersBody"), search = qs("#orderSearch"), statusF = qs("#orderStatusFilter");
    var modalEl = qs("#orderModal");
    if (!tbody) return;

    // Handle ?status= query parameter
    var urlParams = new URLSearchParams(window.location.search);
    var statusParam = urlParams.get("status");
    if (statusParam && statusF) {
      var opts = Array.from(statusF.options).map(function(o){ return o.value; });
      if (opts.indexOf(statusParam) !== -1) {
        statusF.value = statusParam;
      }
    }

    // Fix aria-hidden accessibility issue on modal
    if (modalEl) {
      modalEl.addEventListener('show.bs.modal', function () {
        modalEl.setAttribute('aria-hidden', 'false');
      });
      modalEl.addEventListener('hidden.bs.modal', function () {
        modalEl.setAttribute('aria-hidden', 'true');
      });
    }

  function buildOrderCard(o) {
    var ref = o.ref || o.id || "";
    var itemsCount = Array.isArray(o.items) ? o.items.reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0) : 0;
    var cust = o.customer || {};
    var custName = cust.name || "";
    var custMobile = cust.mobile || "";
    var isNew = (o.status || "New") === "New";
    var shortStatusMap = {
      "New": "New",
      "Confirmed (price and availability confirmed)": "Confirmed",
      "Paid": "Paid or COD",
      "COD arranged": "Paid or COD",
      "Out for delivery": "Out for delivery",
      "Delivered": "Delivered",
      "Cancelled": "Cancelled"
    };
    var badgeClassMap = {
      "New": "badge-new",
      "Confirmed": "badge-confirmed",
      "Paid or COD": "badge-paid-cod",
      "Out for delivery": "badge-out-delivery",
      "Delivered": "badge-delivered",
      "Cancelled": "badge-cancelled"
    };
    var shortStatus = shortStatusMap[o.status || "New"] || (o.status || "New");
    var statusBadge = '<span class="badge ' + (badgeClassMap[shortStatus] || "badge-new") + '" title="' + esc(o.status || "New") + '">' + esc(shortStatus) + '</span>';
    var total = typeof o.subtotal === "number" ? peso(o.subtotal) : '<span class="text-body-secondary small">To be confirmed</span>';
    var delivery = (cust.delivery) || (o.deliveryMethod) || "—";
    var paymentPref = o.paymentPreference || "";
    var paymentMethod = o.paymentMethod || "";
    var isGCash = paymentMethod === 'GCash' || o.paymentStatus === 'pending_verification' || paymentPref === 'GCash';
    var paymentBadgeMap = {
      'GCash': { class: 'badge-gcash', label: 'GCash', icon: 'bi-phone' },
      'Cash on delivery': { class: 'badge-cod', label: 'Cash on delivery', icon: 'bi-truck' },
      'Pay on pickup': { class: 'badge-pickup', label: 'Pay on pickup', icon: 'bi-shop' },
      'Cash': { class: 'badge-cash', label: 'Cash', icon: 'bi-cash' }
    };
    var paymentKey = isGCash ? 'GCash' : (paymentMethod || paymentPref);
    var paymentHtml = '<span class="text-body-secondary">—</span>';
    if (paymentBadgeMap[paymentKey]) {
      paymentHtml = '<span class="badge ' + paymentBadgeMap[paymentKey].class + ' d-inline-flex align-items-center gap-1 px-2 py-1" style="font-size:.75rem"><i class="bi ' + paymentBadgeMap[paymentKey].icon + '"></i> ' + esc(paymentBadgeMap[paymentKey].label) + '</span>';
    } else if (paymentPref) {
      paymentHtml = esc(paymentPref);
    }
    var refPill = isNew ? '<span class="badge badge-new" style="font-size:.7rem">New</span>' : '';
    return '<div class="order-card" data-ref="' + esc(ref) + '">' +
      '<div class="order-row"><div class="order-label">Ref</div><div class="order-value"><span class="fw-semibold text-nowrap tabular-nums">' + esc(ref) + '</span>' + refPill + '</div></div>' +
      '<div class="order-row"><div class="order-label">Customer</div><div class="order-value"><div class="order-cust-name fw-semibold">' + esc(custName) + '</div><div class="order-cust-mobile">' + esc(custMobile) + '</div></div></div>' +
      '<div class="order-row"><div class="order-label">Items</div><div class="order-value">' + itemsCount + ' ' + (itemsCount === 1 ? 'item' : 'items') + '</div></div>' +
      '<div class="order-row"><div class="order-label">Total</div><div class="order-value tabular-nums">' + total + '</div></div>' +
      '<div class="order-row"><div class="order-label">Status</div><div class="order-value">' + statusBadge + '</div></div>' +
      '<div class="order-row"><div class="order-label">Delivery</div><div class="order-value">' + esc(delivery) + '</div></div>' +
      '<div class="order-row"><div class="order-label">Payment</div><div class="order-value">' + paymentHtml + '</div></div>' +
      '<div class="order-actions">' +
        '<button type="button" class="btn btn-outline-primary order-view" data-ref="' + esc(ref) + '" aria-label="View order ' + esc(ref) + '"><i class="bi bi-eye me-1" aria-hidden="true"></i>View</button>' +
        '<button type="button" class="btn btn-outline-secondary order-edit" data-ref="' + esc(ref) + '" aria-label="Edit order ' + esc(ref) + '"><i class="bi bi-pencil me-1" aria-hidden="true"></i>Edit</button>' +
      '</div>' +
    '</div>';
  }

function render() {
      var q = ((search && search.value) || "").toLowerCase();
      var sf = (statusF && statusF.value) || "";
      var list = orders().filter(function (o) {
        var hay = (esc(o.ref) + " " + esc(o.id) + " " + esc(o.customer && o.customer.name) + " " + esc(o.customer && o.customer.mobile)).toLowerCase();
        var statusMatch = !sf || (o.status || "New") === sf;
        var gcashMatch = true;
        if (sf === 'gcash_pending') {
          gcashMatch = o.paymentMethod === 'GCash' && o.paymentStatus === 'pending_verification';
          statusMatch = true;
        } else if (sf === 'gcash_all') {
          gcashMatch = o.paymentMethod === 'GCash' || o.paymentPreference === 'GCash';
          statusMatch = true;
        }
        return (!q || hay.indexOf(q) !== -1) && statusMatch && gcashMatch;
      }).sort(function(a,b){
        var statusOrder = {
          "New": 0,
          "Confirmed (price and availability confirmed)": 1,
          "Paid": 2,
          "COD arranged": 3,
          "Out for delivery": 4,
          "Delivered": 5,
          "Cancelled": 6
        };
        var an = statusOrder[a.status] ?? 99;
        var bn = statusOrder[b.status] ?? 99;
        if (an !== bn) return an - bn;
        return Date.parse(b.timestamp||0) - Date.parse(a.timestamp||0);
      });
      tbody.innerHTML = "";
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-body-secondary">No orders found.</td></tr>';
        var cards = qs("#ordersCards");
        if (cards) cards.innerHTML = '<div class="text-body-secondary p-3 text-center">No orders found.</div>';
        return;
      }
      list.forEach(function (o) {
        var tr = document.createElement("tr");
        var ref = o.ref || o.id || "";
        var itemsCount = Array.isArray(o.items) ? o.items.reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0) : 0;
        
        // Ref column
        var tdRef = document.createElement("td");
        tdRef.className = "col-ref";
        tdRef.setAttribute("data-label", "Ref");
        var refWrap = document.createElement("div");
        refWrap.className = "d-flex align-items-center gap-2 flex-wrap";
        var refTxt = document.createElement("span");
        refTxt.className = "fw-semibold text-nowrap tabular-nums";
        refTxt.textContent = ref;
        refWrap.appendChild(refTxt);
        tdRef.appendChild(refWrap);
        
        // Customer column
        var tdCust = document.createElement("td");
        tdCust.className = "col-customer";
        tdCust.setAttribute("data-label", "Customer");
        var custName = (o.customer && o.customer.name) || "";
        var custMobile = (o.customer && o.customer.mobile) || "";
        var nameEl = document.createElement("div");
        nameEl.className = "fw-semibold text-truncate";
        nameEl.style.maxWidth = "200px";
        nameEl.textContent = custName;
        nameEl.title = custName;
        var mobileEl = document.createElement("div");
        mobileEl.className = "small text-body-secondary";
        mobileEl.style.lineHeight = "1.3";
        mobileEl.textContent = custMobile;
        tdCust.appendChild(nameEl);
        tdCust.appendChild(mobileEl);
        
        // Items column
        var tdItems = document.createElement("td");
        tdItems.className = "col-items text-nowrap";
        tdItems.setAttribute("data-label", "Items");
        tdItems.textContent = itemsCount + (itemsCount === 1 ? " item" : " items");
        
        // Total column
        var tdTotal = document.createElement("td");
        tdTotal.className = "col-total text-end text-nowrap tabular-nums";
        tdTotal.setAttribute("data-label", "Total");
        if (typeof o.subtotal === "number") {
          tdTotal.textContent = peso(o.subtotal);
        } else {
          tdTotal.innerHTML = '<span class="text-body-secondary small">To be confirmed</span>';
        }
        
        // Delivery column
        var tdDelivery = document.createElement("td");
        tdDelivery.className = "col-delivery d-none d-md-table-cell text-nowrap";
        tdDelivery.setAttribute("data-label", "Delivery");
        var delivery = (o.customer && o.customer.delivery) || (o.deliveryMethod) || "—";
        tdDelivery.textContent = delivery;
        
        // Payment column
        var tdPayment = document.createElement("td");
        tdPayment.className = "col-payment d-none d-md-table-cell text-nowrap";
        tdPayment.setAttribute("data-label", "Payment");
        var paymentPref = o.paymentPreference || "";
        var paymentMethod = o.paymentMethod || "";
        var isGCash = paymentMethod === 'GCash' || o.paymentStatus === 'pending_verification' || paymentPref === 'GCash';
        
        var paymentBadgeMap = {
          'GCash': { class: 'badge-gcash', label: 'GCash', icon: 'bi-phone' },
          'Cash on delivery': { class: 'badge-cod', label: 'Cash on delivery', icon: 'bi-truck' },
          'Pay on pickup': { class: 'badge-pickup', label: 'Pay on pickup', icon: 'bi-shop' },
          'Cash': { class: 'badge-cash', label: 'Cash', icon: 'bi-cash' }
        };
        
        var paymentKey = isGCash ? 'GCash' : (paymentMethod || paymentPref);
        var badgeInfo = paymentBadgeMap[paymentKey];
        
        if (badgeInfo) {
          var paymentBadge = document.createElement("span");
          paymentBadge.className = "badge " + badgeInfo.class + " d-flex align-items-center gap-1";
          paymentBadge.innerHTML = '<i class="bi ' + badgeInfo.icon + '"></i> ' + badgeInfo.label;
          if (isGCash && o.paymentStatus === 'pending_verification') {
            paymentBadge.classList.add('blink-soft');
            paymentBadge.title = "Awaiting staff verification";
          } else if (isGCash && paymentMethod !== 'GCash' && paymentPref === 'GCash') {
            paymentBadge.title = "Customer selected GCash but hasn't confirmed payment";
            paymentBadge.classList.add('opacity-75');
          }
          tdPayment.appendChild(paymentBadge);
        } else if (paymentPref) {
          tdPayment.textContent = paymentPref;
        } else {
          tdPayment.innerHTML = '<span class="text-body-secondary">—</span>';
        }
        
        // Status column - short labels with brand colors
        var tdStatus = document.createElement("td");
        tdStatus.className = "col-status text-nowrap";
        tdStatus.setAttribute("data-label", "Status");
        var statusBadge = document.createElement("span");
        var fullStatus = o.status || "New";
        var shortStatusMap = {
          "New": "New",
          "Confirmed (price and availability confirmed)": "Confirmed",
          "Paid": "Paid or COD",
          "COD arranged": "Paid or COD",
          "Out for delivery": "Out for delivery",
          "Delivered": "Delivered",
          "Cancelled": "Cancelled"
        };
        var shortStatus = shortStatusMap[fullStatus] || fullStatus;
        var badgeClassMap = {
          "New": "badge-new",
          "Confirmed": "badge-confirmed",
          "Paid or COD": "badge-paid-cod",
          "Out for delivery": "badge-out-delivery",
          "Delivered": "badge-delivered",
          "Cancelled": "badge-cancelled"
        };
        statusBadge.className = "badge " + (badgeClassMap[shortStatus] || "badge-new");
        statusBadge.textContent = shortStatus;
        statusBadge.title = fullStatus;
        tdStatus.appendChild(statusBadge);
        
        // Actions column
        var tdAct = document.createElement("td");
        tdAct.className = "col-action text-end";
        tdAct.setAttribute("data-label", "Actions");
        var actionWrap = document.createElement("div");
        actionWrap.className = "d-flex gap-2 justify-content-center flex-nowrap";
        
        var vb = document.createElement("button");
        vb.type = "button";
        vb.className = "btn btn-sm btn-outline-primary d-flex align-items-center gap-2";
        vb.style.minWidth = "36px";
        vb.style.height = "32px";
        vb.setAttribute("aria-label", "View order " + ref);
        vb.innerHTML = '<i class="bi bi-eye"></i>';
        vb.addEventListener("click", function () { openOrder(ref, 'view'); });
        
        var eb = document.createElement("button");
        eb.type = "button";
        eb.className = "btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center";
        eb.style.minWidth = "36px";
        eb.style.height = "32px";
        eb.setAttribute("aria-label", "Edit order " + ref);
        eb.innerHTML = '<i class="bi bi-pencil"></i>';
        eb.addEventListener("click", function () { openOrder(ref, 'edit'); });
        
        actionWrap.appendChild(vb);
        actionWrap.appendChild(eb);
        tdAct.appendChild(actionWrap);
        
        tr.appendChild(tdRef);
        tr.appendChild(tdCust);
        tr.appendChild(tdItems);
        tr.appendChild(tdTotal);
        tr.appendChild(tdDelivery);
        tr.appendChild(tdPayment);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAct);
        tbody.appendChild(tr);
      });
      var cardsEl = qs("#ordersCards");
      if (cardsEl) {
        cardsEl.innerHTML = list.map(buildOrderCard).join("");
        cardsEl.querySelectorAll(".order-view").forEach(function (btn) {
          btn.addEventListener("click", function () { openOrder(btn.getAttribute("data-ref"), "view"); });
        });
        cardsEl.querySelectorAll(".order-edit").forEach(function (btn) {
          btn.addEventListener("click", function () { openOrder(btn.getAttribute("data-ref"), "edit"); });
        });
      }
      updateNewOrdersBadge();
    }

    function openOrder(id, mode) {
      var o = orders().find(function (x) { return x.id === id || x.ref === id; });
      if (!o) return;
      setText(qs("#omRef"), o.ref || o.id || "");
      setText(qs("#omDate"), fmtDate(o.timestamp));
      setText(qs("#omName"), (o.customer && o.customer.name) || "");
      setText(qs("#omMobile"), (o.customer && o.customer.mobile) || "");
      // Address can be at order level (new) or customer level (legacy)
      var addr = o.address || (o.customer && o.customer.address) || "—";
      setText(qs("#omAddress"), addr);
      setText(qs("#omType"), (o.customer && o.customer.customerType) || "—");
      setText(qs("#omDelivery"), (o.customer && o.customer.delivery) || o.deliveryMethod || "—");
      setText(qs("#omPayment"), o.paymentPreference || "—");
      setText(qs("#omNotes"), o.notes || "—");
      setText(qs("#omTotal"), (typeof o.subtotal === "number") ? peso(o.subtotal) : "To be confirmed");
      var itemsEl = qs("#omItems");
      if (itemsEl) {
        itemsEl.innerHTML = "";
        (o.items || []).forEach(function (it) {
          var li = document.createElement("li");
          li.className = "list-group-item d-flex align-items-center gap-3 px-3 py-2";
          
          // Product image
          var imgPath = it.image;
          if (imgPath && !imgPath.startsWith("data:") && !imgPath.startsWith("http") && !imgPath.startsWith("../")) {
            imgPath = "../" + imgPath;
          }
          var img = document.createElement("img");
          img.src = imgPath || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect fill='%23e9ecef' width='56' height='56' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-size='10' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";
          img.alt = it.name || it.id || "Item";
          img.style.width = "48px";
          img.style.height = "48px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "8px";
          img.style.border = "1px solid var(--bs-border-color)";
          img.style.flexShrink = "0";
          li.appendChild(img);
          
          // Product details
          var left = document.createElement("div");
          left.style.flex = "1";
          left.style.minWidth = "0";
          var nm = document.createElement("div");
          nm.className = "fw-semibold text-truncate";
          nm.style.lineHeight = "1.3";
          nm.textContent = (it.name || it.id || "Item") + " × " + (it.qty || 1);
          nm.title = (it.name || it.id || "Item") + " × " + (it.qty || 1);
          var meta = document.createElement("div");
          meta.className = "small text-body-secondary text-truncate";
          meta.style.lineHeight = "1.3";
          var bits = [];
          if (it.brand) bits.push(it.brand);
          if (it.size) bits.push(it.size);
          if (it.variantLabel) bits.push(it.variantLabel);
          meta.textContent = bits.join(" · ");
          meta.title = bits.join(" · ");
          left.appendChild(nm);
          left.appendChild(meta);
          li.appendChild(left);
          
          // Price
          var right = document.createElement("div");
          right.className = "text-end text-nowrap";
          right.style.minWidth = "100px";
          var price = it.unitPrice != null ? it.unitPrice : it.price;
          var priceEl = document.createElement("div");
          priceEl.className = "fw-semibold tabular-nums";
          priceEl.style.lineHeight = "1.3";
          priceEl.textContent = (price != null) ? peso(price) : "Ask for price";
          var qtyEl = document.createElement("div");
          qtyEl.className = "small text-body-secondary";
          qtyEl.style.lineHeight = "1.3";
          qtyEl.textContent = "Qty: " + (it.qty || 1);
          right.appendChild(priceEl);
          right.appendChild(qtyEl);
          li.appendChild(right);
          
          itemsEl.appendChild(li);
        });
        if (!(o.items || []).length) {
          var li0 = document.createElement("li");
          li0.className = "list-group-item text-body-secondary text-center py-4";
          li0.textContent = "No items.";
          itemsEl.appendChild(li0);
        }
      }
      var tl = qs("#omTimeline");
      if (tl) {
        tl.innerHTML = "";
        (o.timeline || []).forEach(function (t) {
          var li = document.createElement("li"); li.className = "list-group-item";
          var s = document.createElement("div"); s.className = "fw-semibold"; s.textContent = t.status || "";
          var d = document.createElement("div"); d.className = "small text-body-secondary"; d.textContent = fmtDate(t.at);
          li.appendChild(s); li.appendChild(d); tl.appendChild(li);
        });
        if (!(o.timeline || []).length) {
          var li1 = document.createElement("li"); li1.className = "list-group-item text-body-secondary"; li1.textContent = "No timeline yet."; tl.appendChild(li1);
        }
      }

      // Populate view mode fields
      var viewStatusEl = qs("#viewStatus");
      var fullStatus = o.status || "New";
      var shortStatusMap = {
        "New": "New",
        "Confirmed (price and availability confirmed)": "Confirmed",
        "Paid": "Paid or COD",
        "COD arranged": "Paid or COD",
        "Out for delivery": "Out for delivery",
        "Delivered": "Delivered",
        "Cancelled": "Cancelled"
      };
      var badgeClassMap = {
        "New": "badge-new",
        "Confirmed": "badge-confirmed",
        "Paid or COD": "badge-paid-cod",
        "Out for delivery": "badge-out-delivery",
        "Delivered": "badge-delivered",
        "Cancelled": "badge-cancelled"
      };
      var shortStatus = shortStatusMap[fullStatus] || fullStatus;
      viewStatusEl.textContent = shortStatus;
      viewStatusEl.className = "badge " + (badgeClassMap[shortStatus] || "badge-new") + " px-2 py-1";
      viewStatusEl.style.fontSize = ".75rem";
      viewStatusEl.title = fullStatus;
      
      var viewPaymentEl = qs("#viewPaymentMethod");
      var paymentPref = o.paymentPreference || "";
      var paymentMethod = o.paymentMethod || "";
      var isGCash = paymentMethod === 'GCash' || o.paymentStatus === 'pending_verification' || paymentPref === 'GCash';
      
      var paymentBadgeMap = {
        'GCash': { class: 'badge-gcash', label: 'GCash', icon: 'bi-phone' },
        'Cash on delivery': { class: 'badge-cod', label: 'Cash on delivery', icon: 'bi-truck' },
        'Pay on pickup': { class: 'badge-pickup', label: 'Pay on pickup', icon: 'bi-shop' },
        'Cash': { class: 'badge-cash', label: 'Cash', icon: 'bi-cash' }
      };
      
      var paymentKey = isGCash ? 'GCash' : (paymentMethod || paymentPref);
      var badgeInfo = paymentBadgeMap[paymentKey];
      
      viewPaymentEl.innerHTML = "";
      if (badgeInfo) {
        var paymentBadge = document.createElement("span");
        paymentBadge.className = "badge " + badgeInfo.class + " d-inline-flex align-items-center gap-1 px-2 py-1";
        paymentBadge.style.fontSize = ".75rem";
        paymentBadge.innerHTML = '<i class="bi ' + badgeInfo.icon + '"></i> ' + badgeInfo.label;
        if (isGCash && o.paymentStatus === 'pending_verification') {
          paymentBadge.classList.add('blink-soft');
          paymentBadge.title = "Awaiting staff verification";
        } else if (isGCash && paymentMethod !== 'GCash' && paymentPref === 'GCash') {
          paymentBadge.title = "Customer selected GCash but hasn't confirmed payment";
          paymentBadge.classList.add('opacity-75');
        }
        viewPaymentEl.appendChild(paymentBadge);
      } else if (paymentPref) {
        viewPaymentEl.textContent = paymentPref;
      } else {
        viewPaymentEl.innerHTML = '<span class="text-body-secondary">—</span>';
      }
      qs("#viewPickupReady").checked = !!o.pickupReady;
      qs("#viewDeliveredMark").checked = (o.status === "Delivered");
      setText(qs("#viewStaffNote"), o.staffNote || "—");

      // Populate edit mode fields
      var statusSel = qs("#omStatus");
      if (statusSel) { statusSel.value = o.status || "New"; }
      var pmEditSel = qs("#omPaymentMethodEdit");
      if (pmEditSel) { pmEditSel.value = o.paymentMethod || o.paymentPreference || ""; }
      var note = qs("#omStaffNote");
      if (note) note.value = o.staffNote || "";
      var pickup = qs("#omPickupReady");
      if (pickup) pickup.checked = !!o.pickupReady;
      var delivered = qs("#omDeliveredMark");
      if (delivered) delivered.checked = (o.status === "Delivered");

      // View/Edit toggle
      var viewMode = qs("#orderViewMode");
      var editMode = qs("#orderEditMode");
      var btnEdit = qs("#btnEditOrder");
      var btnSave = qs("#omSave");
      var btnCancel = qs("#omCancelEdit");

      function enterEditMode() {
        viewMode.classList.add("d-none");
        editMode.classList.remove("d-none");
        btnSave.classList.remove("d-none");
        btnCancel.classList.remove("d-none");
      }
      function exitEditMode() {
        viewMode.classList.remove("d-none");
        editMode.classList.add("d-none");
        btnSave.classList.add("d-none");
        btnCancel.classList.add("d-none");
      }

      // Default to view mode, unless 'edit' passed
      if (mode === 'edit') {
        enterEditMode();
      } else {
        exitEditMode();
      }

      if (btnEdit) {
        btnEdit.onclick = function () { enterEditMode(); };
      }
      if (btnCancel) {
        btnCancel.onclick = function () { exitEditMode(); };
      }

      var saveBtn = qs("#omSave");
      if (saveBtn) {
        saveBtn.onclick = function () {
          var cur = orders().find(function (x) { return x.id === o.id || x.ref === o.ref; }) || o;
          var newStatus = statusSel ? statusSel.value : (cur.status || "New");
          var newPaymentMethod = pmEditSel ? pmEditSel.value : "";
          var changed = newStatus !== (cur.status || "New") || newPaymentMethod !== (cur.paymentMethod || "");
          cur.status = newStatus;
          cur.paymentMethod = newPaymentMethod || cur.paymentMethod;
          cur.staffNote = note ? note.value : (cur.staffNote || "");
          cur.pickupReady = pickup ? !!pickup.checked : !!cur.pickupReady;
          if (delivered && delivered.checked) cur.status = "Delivered";
          if (!Array.isArray(cur.timeline)) cur.timeline = [];
          if (changed || (delivered && delivered.checked && newStatus === "Delivered")) {
            cur.timeline.push({ status: cur.status, at: new Date().toISOString() });
          }
          saveRecord("ecm_orders", cur);
          toast("Order updated");
          bootstrap.Modal.getInstance(modalEl).hide();
          updateNewOrdersBadge();
          render();
        };
      }
      var printBtn = qs("#omPrint");
      if (printBtn) {
        printBtn.onclick = function () { printOrderSlip(o); };
      }
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    function printOrderSlip(o) {
      var w = window.open("", "_blank");
      if (!w) return;
      var items = (o.items || []).map(function (it) {
        var label = esc(it.name || it.id || "Item") + " x " + esc(it.qty || 1);
        if (it.variantLabel) label += " (" + esc(it.variantLabel) + ")";
        return "<li>" + label + "</li>";
      }).join("");
      var html = '<!doctype html><html><head><meta charset="utf-8"><title>Order ' + esc(o.ref || o.id) + '</title>' +
        '<style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{margin:0 0 8px} .muted{color:#555} ul{padding-left:20px}</style></head><body>' +
        '<h1>EC Marketing Corporation</h1><div class="muted">Order slip</div><hr>' +
        '<p><strong>Reference:</strong> ' + esc(o.ref || o.id) + '<br><strong>Date:</strong> ' + esc(fmtDate(o.timestamp)) + '<br>' +
        '<strong>Status:</strong> ' + esc(o.status || "New") + '</p>' +
        '<p><strong>Customer:</strong> ' + esc((o.customer && o.customer.name) || "") + '<br>' +
        '<strong>Mobile:</strong> ' + esc((o.customer && o.customer.mobile) || "") + '<br>' +
        '<strong>Delivery:</strong> ' + esc((o.customer && o.customer.delivery) || "") + '<br>' +
        '<strong>Payment:</strong> ' + esc((o.customer && o.customer.payment) || "") + '</p>' +
        '<p><strong>Items</strong></p><ul>' + (items || "<li>No items</li>") + '</ul>' +
        '<p><strong>Total:</strong> ' + esc((typeof o.subtotal === "number") ? peso(o.subtotal) : "To be confirmed") + '</p>' +
        '<p><strong>Notes:</strong> ' + esc((o.customer && o.customer.notes) || "—") + '</p>' +
        '<p><strong>Staff note:</strong> ' + esc(o.staffNote || "—") + '</p>' +
        '<script>window.onload=function(){window.print();};<\/script></body></html>';
      w.document.open(); w.document.write(html); w.document.close();
    }

    if (search) search.addEventListener("input", render);
    if (statusF) statusF.addEventListener("change", render);
    render();
  }

  /* -------- Inquiries & Quotes -------- */
  function initInquiries() {
    initShell("inquiries");
    var inqBody = qs("#inquiriesBody"), quoteBody = qs("#quotesBody");
    var inqTab = qs("#inq-tab"), quoteTab = qs("#quote-tab");

    // Handle ?tab=quotes query parameter
    var urlParams = new URLSearchParams(window.location.search);
    var tabParam = urlParams.get("tab");
    if (tabParam === "quotes" && quoteTab) {
      var bsTab = new bootstrap.Tab(quoteTab);
      bsTab.show();
    }

    function renderInquiries() {
      if (!inqBody) return;
      var list = inquiries();
      inqBody.innerHTML = "";
      if (!list.length) { inqBody.innerHTML = '<tr><td colspan="5" class="text-body-secondary">No inquiries yet.</td></tr>'; return; }
      list.forEach(function (r) {
        var tr = document.createElement("tr");
        var tdDate = document.createElement("td"); tdDate.textContent = fmtDate(r.timestamp); tdDate.setAttribute("data-label", "Date");
        var tdName = document.createElement("td"); tdName.setAttribute("data-label", "Customer");
        var nm = document.createElement("div"); nm.className = "fw-semibold"; nm.textContent = r.name || "";
        var ct = document.createElement("div"); ct.className = "small text-body-secondary"; ct.textContent = (r.ref||r.id||"") + (r.mobile ? " · " + r.mobile : "");
        tdName.appendChild(nm); tdName.appendChild(ct);
        var tdSub = document.createElement("td"); tdSub.textContent = r.productName ? ("Product: " + r.productName) : (r.subject || (r.type==="contact" ? "Contact inquiry" : "Inquiry")); tdSub.setAttribute("data-label", "Subject");
        var tdStatus = document.createElement("td"); tdStatus.setAttribute("data-label", "Status");
        var isReplied = !!(r.replied || r.status === "Replied");
        var badge = document.createElement("span"); badge.className = "badge " + (isReplied ? "text-bg-success" : "text-bg-warning"); badge.textContent = isReplied ? "Replied" : "Pending";
        tdStatus.appendChild(badge);
        var tdAct = document.createElement("td"); tdAct.setAttribute("data-label", "Actions");
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn-sm btn-outline-primary"; btn.textContent = "View / Update";
        btn.addEventListener("click", function () { openRecordModal(r, "ecm_inquiries", "Inquiry", renderInquiries); });
        tdAct.appendChild(btn);
        tr.appendChild(tdDate); tr.appendChild(tdName); tr.appendChild(tdSub); tr.appendChild(tdStatus); tr.appendChild(tdAct);
        inqBody.appendChild(tr);
      });
    }
    function renderQuotes() {
      if (!quoteBody) return;
      var list = quotes();
      quoteBody.innerHTML = "";
      if (!list.length) { quoteBody.innerHTML = '<tr><td colspan="5" class="text-body-secondary">No quote requests yet.</td></tr>'; return; }
      list.forEach(function (r) {
        var tr = document.createElement("tr");
        var tdDate = document.createElement("td"); tdDate.textContent = fmtDate(r.timestamp); tdDate.setAttribute("data-label", "Date");
        var tdName = document.createElement("td"); tdName.setAttribute("data-label", "Customer");
        var nm = document.createElement("div"); nm.className = "fw-semibold"; nm.textContent = r.name || "";
        var ct = document.createElement("div"); ct.className = "small text-body-secondary"; ct.textContent = (r.ref||r.id||"") + (r.mobile ? " · " + r.mobile : "");
        tdName.appendChild(nm); tdName.appendChild(ct);
        var tdType = document.createElement("td"); tdType.setAttribute("data-label", "Details");
        var matCount = Array.isArray(r.materials) ? r.materials.length : 0;
        tdType.textContent = (r.customerType || "Quote") + (r.projectLocation ? " · " + r.projectLocation : "") + (matCount ? " · " + matCount + " item(s)" : "");
        var tdStatus = document.createElement("td"); tdStatus.setAttribute("data-label", "Status");
        var isReplied = !!(r.replied || r.status === "Replied");
        var badge = document.createElement("span"); badge.className = "badge " + (isReplied ? "text-bg-success" : "text-bg-warning"); badge.textContent = isReplied ? "Replied" : "Pending";
        tdStatus.appendChild(badge);
        var tdAct = document.createElement("td"); tdAct.setAttribute("data-label", "Actions");
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn-sm btn-outline-primary"; btn.textContent = "View / Update";
        btn.addEventListener("click", function () { openRecordModal(r, "ecm_quotes", "Quote request", renderQuotes); });
        tdAct.appendChild(btn);
        tr.appendChild(tdDate); tr.appendChild(tdName); tr.appendChild(tdType); tr.appendChild(tdStatus); tr.appendChild(tdAct);
        quoteBody.appendChild(tr);
      });
    }

    function openRecordModal(r, key, label, onSave) {
      var modalEl = qs("#recordModal");
      if (!modalEl) return;

      // Fix aria-hidden accessibility issue on modal
      modalEl.addEventListener('show.bs.modal', function handlerShow() {
        modalEl.setAttribute('aria-hidden', 'false');
        modalEl.removeEventListener('show.bs.modal', handlerShow);
      }, { once: true });
      modalEl.addEventListener('hidden.bs.modal', function handlerHide() {
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.removeEventListener('hidden.bs.modal', handlerHide);
      }, { once: true });

      setText(qs("#rmTitle"), label + (r.ref || r.id ? " · " + (r.ref||r.id) : ""));
      setText(qs("#rmDate"), fmtDate(r.timestamp));
      setText(qs("#rmFrom"), (r.name || "") + (r.mobile ? " · " + r.mobile : "") + (r.email ? " · " + r.email : ""));
      var subj = r.productName ? ("Product inquiry: " + r.productName + (r.variantLabel ? " ("+r.variantLabel+")" : "")) : (r.subject || r.customerType || r.type || "—");
      setText(qs("#rmSubject"), subj);
      var body = r.message || r.details || "";
      if (!body && Array.isArray(r.materials)) body = "Materials:\n- " + r.materials.join("\n- ");
      setText(qs("#rmMessage"), body || "—");
      var metaBits = [];
      if (r.projectLocation) metaBits.push("Location: " + r.projectLocation);
      if (r.neededBy) metaBits.push("Needed by: " + r.neededBy);
      if (r.delivery) metaBits.push("Delivery: " + r.delivery);
      if (r.company) metaBits.push("Company: " + r.company);
      setText(qs("#rmMeta"), metaBits.length ? metaBits.join(" · ") : "—");
      var replied = qs("#rmReplied"); if (replied) replied.checked = !!(r.replied || r.status === "Replied");
      var note = qs("#rmStaffNote"); if (note) note.value = r.staffNote || "";
      var save = qs("#rmSave");
      if (save) {
        save.onclick = function () {
          var all = (key === "ecm_inquiries") ? inquiries() : quotes();
          var cur = all.find(function (x) { return x.id === r.id; }) || r;
          cur.replied = replied ? !!replied.checked : !!cur.replied;
          cur.status = cur.replied ? "Replied" : "Pending";
          cur.staffNote = note ? note.value : (cur.staffNote || "");
          saveRecord(key, cur);
          toast(label + " updated");
          bootstrap.Modal.getInstance(modalEl).hide();
          if (typeof onSave === "function") onSave();
        };
      }
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    renderInquiries();
    renderQuotes();
    if (inqTab) inqTab.addEventListener("shown.bs.tab", renderInquiries);
    if (quoteTab) quoteTab.addEventListener("shown.bs.tab", renderQuotes);
  }

  /* -------- Feedback -------- */
  function initFeedback() {
    initShell("feedback");
    var listEl = qs("#feedbackList"), avgEl = qs("#feedbackAvg"), byServiceEl = qs("#feedbackByService");
    if (!listEl) return;
    function render() {
      var fbs = feedback();
      listEl.innerHTML = "";
      if (!fbs.length) {
        listEl.innerHTML = '<div class="alert alert-light border mb-0">No feedback yet. Encourage customers to share their experience.</div>';
      } else {
        fbs.forEach(function (f) {
          var card = document.createElement("div"); card.className = "card shadow-sm border-0 mb-3";
          var body = document.createElement("div"); body.className = "card-body";
          var head = document.createElement("div"); head.className = "d-flex justify-content-between align-items-start gap-2 flex-wrap";
          var left = document.createElement("div");
          var nm = document.createElement("div"); nm.className = "fw-semibold"; nm.textContent = f.name || "Customer";
          var meta = document.createElement("div"); meta.className = "small text-body-secondary"; meta.textContent = (f.serviceType || "Service") + " · " + fmtDate(f.timestamp);
          left.appendChild(nm); left.appendChild(meta);
          var rating = document.createElement("span"); rating.className = "badge text-bg-warning"; rating.textContent = (Number(f.rating) || 0) + " / 5";
          head.appendChild(left); head.appendChild(rating);
          var msg = document.createElement("p"); msg.className = "mb-0 mt-2"; msg.textContent = f.comments || f.message || "";
          body.appendChild(head); body.appendChild(msg);
          card.appendChild(body); listEl.appendChild(card);
        });
      }
      var avg = 0; if (fbs.length) avg = fbs.reduce(function (s, f) { return s + (Number(f.rating) || 0); }, 0) / fbs.length;
      if (avgEl) avgEl.textContent = fbs.length ? (Math.round(avg * 10) / 10) + " / 5 (" + fbs.length + " feedback)" : "No feedback yet";
      if (byServiceEl) {
        byServiceEl.innerHTML = "";
        if (!fbs.length) { byServiceEl.innerHTML = '<li class="list-group-item text-body-secondary">No data yet.</li>'; }
        else {
          var by = {};
          fbs.forEach(function (f) {
            var k = f.serviceType || "Other";
            if (!by[k]) by[k] = { sum: 0, n: 0 };
            by[k].sum += (Number(f.rating) || 0); by[k].n++;
          });
          Object.keys(by).sort().forEach(function (k) {
            var li = document.createElement("li"); li.className = "list-group-item d-flex justify-content-between";
            var a = document.createElement("span"); a.textContent = k;
            var b = document.createElement("span"); b.className = "fw-semibold"; b.textContent = (Math.round((by[k].sum / by[k].n) * 10) / 10) + " / 5 (" + by[k].n + ")";
            li.appendChild(a); li.appendChild(b); byServiceEl.appendChild(li);
          });
        }
      }
    }
    render();
  }

  /* -------- Settings & sample data -------- */
  function genRef(i) {
    var d = new Date(); var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return "ECM-" + y + m + day + "-" + String(1000 + i);
  }
  function initSettings() {
    initShell("settings");
    var loadBtn = qs("#loadSampleBtn"), exportBtn = qs("#exportBtn"), importInput = qs("#importFile"), resetBtn = qs("#resetBtn");
    var status = qs("#settingsStatus");
    function setStatus(msg, ok) {
      if (!status) return;
      status.className = "alert mt-3 " + (ok ? "alert-success" : "alert-warning");
      status.textContent = msg;
      status.classList.remove("d-none");
    }

    function loadSample() {
      var now = Date.now();
      var sampleOrders = [
        { ref: genRef(1), status: "New", timestamp: new Date(now - 3600*1000).toISOString(), customer: { name: "Maria Santos", mobile: "09171234567", address: "Brgy Central, Calbayog City", customerType: "Homeowner", delivery: "Delivery", notes: "Call before delivery" }, paymentPreference: "Cash on delivery", items: [{ id: "paint-davies-4l", name: "Davies Paint", qty: 2, price: 780 }], subtotal: 1560, staffNote: "", timeline: [{ status: "New", at: new Date(now - 3600*1000).toISOString() }] },
        { ref: genRef(2), status: "Confirmed (price and availability confirmed)", timestamp: new Date(now - 7200*1000).toISOString(), customer: { name: "Juan Dela Cruz", mobile: "09179876543", address: "Brgy Obrero, Calbayog City", customerType: "Contractor", delivery: "Pickup", notes: "" }, paymentPreference: "Cash", items: [{ id: "cement-republic-40kg", name: "Republic Portland Cement 40kg", qty: 10, price: 245 }], subtotal: 2450, staffNote: "Ready for pickup", timeline: [{ status: "New", at: new Date(now - 7200*1000).toISOString() }, { status: "Confirmed (price and availability confirmed)", at: new Date(now - 5400*1000).toISOString() }] },
        { ref: genRef(3), status: "Paid", timestamp: new Date(now - 86400*1000).toISOString(), customer: { name: "Maria Santos", mobile: "09171234567", address: "Brgy Central, Calbayog City", customerType: "Homeowner", delivery: "Delivery", notes: "" }, paymentPreference: "GCash", paymentMethod: "GCash", paymentStatus: "verified", items: [{ id: "plumbing-pvc-1in", name: "PVC Pipe 1 inch", qty: 6, price: 120 }], subtotal: 720, staffNote: "Repeat customer - GCash verified", timeline: [{ status: "New", at: new Date(now - 86400*1000).toISOString() }, { status: "Paid", at: new Date(now - 80000*1000).toISOString() }] },
        { ref: genRef(4), status: "COD arranged", timestamp: new Date(now - 1*86400*1000).toISOString(), customer: { name: "Ana Reyes", mobile: "09170001111", address: "Brgy Carmen, Calbayog City", customerType: "Homeowner", delivery: "Delivery", notes: "Gate code 1234" }, paymentPreference: "Cash on delivery", paymentMethod: "Cash on delivery", items: [{ id: "tank-besta-slim-500", name: "Bestank Slim Water Tank 500L", qty: 1, price: 3450 }], subtotal: 3450, staffNote: "Driver assigned for COD delivery", timeline: [{ status: "New", at: new Date(now - 1*86400*1000).toISOString() }, { status: "COD arranged", at: new Date(now - 80000*1000).toISOString() }] },
        { ref: genRef(5), status: "Out for delivery", timestamp: new Date(now - 2*86400*1000).toISOString(), customer: { name: "Pedro Lim", mobile: "09172223333", address: "Brgy Balud, Calbayog City", customerType: "Hardware/Reseller", delivery: "Delivery", notes: "" }, paymentPreference: "Cash on delivery", paymentMethod: "Cash on delivery", items: [{ id: "electrical-wire-thhn-2", name: "THHN Wire #12", qty: 20, price: 38 }], subtotal: 760, staffNote: "Driver: onsite team", timeline: [{ status: "New", at: new Date(now - 2*86400*1000).toISOString() }, { status: "Out for delivery", at: new Date(now - 2*86400*1000 + 3600*1000).toISOString() }] },
        { ref: genRef(6), status: "Delivered", timestamp: new Date(now - 3*86400*1000).toISOString(), customer: { name: "Liza Gomez", mobile: "09174445555", address: "Brgy Rawis, Calbayog City", customerType: "Homeowner", delivery: "Pickup", notes: "" }, paymentPreference: "Cash", paymentMethod: "Cash", items: [{ id: "garden-hose-20m", name: "Garden Hose 20m", qty: 1, price: 450 }], subtotal: 450, staffNote: "Delivered and signed", timeline: [{ status: "New", at: new Date(now - 3*86400*1000).toISOString() }, { status: "Delivered", at: new Date(now - 3*86400*1000 + 7200*1000).toISOString() }] },
        { ref: genRef(7), status: "Cancelled", timestamp: new Date(now - 4*86400*1000).toISOString(), customer: { name: "Mark Villanueva", mobile: "09176667777", address: "Brgy Dagum, Calbayog City", customerType: "Contractor", delivery: "Delivery", notes: "Site delivery" }, paymentPreference: "Cash on delivery", items: [{ id: "rebar-steelasia-10mm-6m", name: "SteelAsia Rebar 10mm x 6m", qty: 30, price: 185 }], subtotal: 5550, staffNote: "Customer cancelled", timeline: [{ status: "New", at: new Date(now - 4*86400*1000).toISOString() }, { status: "Cancelled", at: new Date(now - 4*86400*1000 + 1800*1000).toISOString() }] },
        { ref: genRef(8), status: "New", timestamp: new Date(now - 5*86400*1000).toISOString(), customer: { name: "Carla Tan", mobile: "09178889999", address: "Brgy Capoocan, Calbayog City", customerType: "Homeowner", delivery: "Pickup", notes: "" }, paymentPreference: "Cash", items: [{ id: "fasteners-common-nails-1kg", name: "Common Nails 1kg", qty: 5, price: 95 }], subtotal: 475, staffNote: "", timeline: [{ status: "New", at: new Date(now - 5*86400*1000).toISOString() }] },
        { ref: genRef(9), status: "Confirmed (price and availability confirmed)", timestamp: new Date(now - 6*86400*1000).toISOString(), customer: { name: "Robert Cruz", mobile: "09171112233", address: "Brgy Tinambacan, Calbayog City", customerType: "Contractor", delivery: "Delivery", notes: "Urgent project" }, paymentPreference: "GCash", items: [{ id: "paint-boysen-4l", name: "Boysen Paint", qty: 5, price: 820 }], subtotal: 4100, staffNote: "Price confirmed, awaiting payment", timeline: [{ status: "New", at: new Date(now - 6*86400*1000).toISOString() }, { status: "Confirmed (price and availability confirmed)", at: new Date(now - 6*86400*1000 + 3600*1000).toISOString() }] },
        { ref: genRef(10), status: "Paid", timestamp: new Date(now - 7*86400*1000).toISOString(), customer: { name: "Sarah Lim", mobile: "09174445566", address: "Brgy Hamorawon, Calbayog City", customerType: "Homeowner", delivery: "Pickup", notes: "" }, paymentPreference: "GCash", paymentMethod: "GCash", paymentStatus: "verified", items: [{ id: "tools-bosch-gsb550", name: "Bosch GSB 550 Drill", qty: 1, price: 3850 }], subtotal: 3850, staffNote: "GCash payment verified", timeline: [{ status: "New", at: new Date(now - 7*86400*1000).toISOString() }, { status: "Paid", at: new Date(now - 7*86400*1000 + 1800*1000).toISOString() }] },
        { ref: genRef(11), status: "COD arranged", timestamp: new Date(now - 8*86400*1000).toISOString(), customer: { name: "BuildRight Co.", mobile: "09173334444", address: "Calbayog City", customerType: "Contractor", delivery: "Delivery", notes: "Bulk order - site delivery" }, paymentPreference: "Cash on delivery", paymentMethod: "Cash on delivery", items: [{ id: "cement-republic-40kg", name: "Republic Portland Cement 40kg", qty: 50, price: 245 }, { id: "rebar-steelasia-10mm-6m", name: "SteelAsia Rebar 10mm x 6m", qty: 40, price: 185 }, { id: "blocks-chb-4inch", name: "CHB 4 inch", qty: 200, price: 15 }], subtotal: 22250, staffNote: "Large COD order - driver dispatched", timeline: [{ status: "New", at: new Date(now - 8*86400*1000).toISOString() }, { status: "Confirmed (price and availability confirmed)", at: new Date(now - 8*86400*1000 + 7200*1000).toISOString() }, { status: "COD arranged", at: new Date(now - 8*86400*1000 + 14400*1000).toISOString() }] },
        { ref: genRef(12), status: "Delivered", timestamp: new Date(now - 9*86400*1000).toISOString(), customer: { name: "HomeFix", mobile: "09175556666", address: "Brgy Aguit-itan, Calbayog City", customerType: "Homeowner", delivery: "Pickup", notes: "" }, paymentPreference: "Cash", paymentMethod: "Cash", items: [{ id: "plumbing-pvc-1in", name: "PVC Pipe 1 inch", qty: 10, price: 120 }, { id: "garden-hose-20m", name: "Garden Hose 20m", qty: 2, price: 450 }], subtotal: 2100, staffNote: "Completed pickup order", timeline: [{ status: "New", at: new Date(now - 9*86400*1000).toISOString() }, { status: "Confirmed (price and availability confirmed)", at: new Date(now - 9*86400*1000 + 3600*1000).toISOString() }, { status: "Delivered", at: new Date(now - 9*86400*1000 + 10800*1000).toISOString() }] }
      ];
      var sampleInquiries = [
        { id: "SAMPLE-INQ-1", timestamp: new Date(now - 4000*1000).toISOString(), name: "Rita Cruz", mobile: "09170112233", email: "rita.sample@example.com", subject: "Product availability", message: "Do you have Bosch drill in stock?", replied: false, staffNote: "" },
        { id: "SAMPLE-INQ-2", timestamp: new Date(now - 90000*1000).toISOString(), name: "Noel Tan", mobile: "09170445566", email: "", subject: "Delivery coverage", message: "Do you deliver to Gandara?", replied: true, staffNote: "Advised to confirm by phone" },
        { id: "SAMPLE-INQ-3", timestamp: new Date(now - 2*86400*1000).toISOString(), name: "Mae Santos", mobile: "09170778899", email: "mae.sample@example.com", subject: "Paint colors", message: "Looking for off-white interior paint.", replied: false, staffNote: "" },
        { id: "SAMPLE-INQ-4", timestamp: new Date(now - 3*86400*1000).toISOString(), name: "Joel Reyes", mobile: "09170990011", email: "", subject: "Store hours", message: "Are you open on Saturday afternoon?", replied: true, staffNote: "Shared Saturday hours" },
        { id: "SAMPLE-INQ-5", timestamp: new Date(now - 4*86400*1000).toISOString(), name: "BuildRight Co.", mobile: "09173334444", email: "procurement@buildright.com", subject: "Bulk pricing inquiry", message: "Need 100 bags cement, 50 pcs 10mm rebar, 300 CHB for project next month. Can you give contractor pricing?", replied: false, staffNote: "" },
        { id: "SAMPLE-INQ-6", timestamp: new Date(now - 5*86400*1000).toISOString(), name: "Sarah Lim", mobile: "09174445566", email: "", subject: "Water tank installation", message: "Do you offer installation for the 500L water tank? What's the cost?", replied: true, staffNote: "Installation available at ₱1,500. Scheduled for Thursday." },
        { id: "SAMPLE-INQ-7", timestamp: new Date(now - 6*86400*1000).toISOString(), name: "Robert Cruz", mobile: "09171112233", email: "robert.cruz@email.com", subject: "Paint warranty", message: "Does Boysen paint come with warranty? Need for exterior walls.", replied: true, staffNote: "5-year warranty on exterior paints. Shared brochure." },
        { id: "SAMPLE-INQ-8", timestamp: new Date(now - 7*86400*1000).toISOString(), name: "Carla Tan", mobile: "09178889999", email: "", subject: "Payment methods", message: "Can I pay via GCash for pickup order? How does it work?", replied: true, staffNote: "Yes, GCash accepted. Sent payment details via SMS." }
      ];
      var sampleQuotes = [
        { id: "SAMPLE-QUO-1", timestamp: new Date(now - 5000*1000).toISOString(), name: "BuildRight Co.", mobile: "09173334444", customerType: "Contractor", projectType: "Small house build", location: "Calbayog City", materials: "Cement 50 bags, rebar 10mm 40 pcs, CHB 200 pcs", message: "Please quote bulk pricing.", replied: false, staffNote: "" },
        { id: "SAMPLE-QUO-2", timestamp: new Date(now - 86400*1000).toISOString(), name: "HomeFix", mobile: "09175556666", customerType: "Homeowner", projectType: "Bathroom repair", location: "Brgy Aguit-itan", materials: "PVC pipes, fittings, sealant", message: "Need estimate for repair materials.", replied: true, staffNote: "Sent estimate via SMS" },
        { id: "SAMPLE-QUO-3", timestamp: new Date(now - 2*86400*1000).toISOString(), name: "Robert Cruz", mobile: "09171112233", customerType: "Contractor", projectType: "Apartment renovation", location: "Brgy Tinambacan", materials: "Paint 20 cans, tiles 50 sqm, cement 30 bags", message: "Full renovation package quote needed.", replied: false, staffNote: "Preparing detailed quote" },
        { id: "SAMPLE-QUO-4", timestamp: new Date(now - 3*86400*1000).toISOString(), name: "Mae Santos", mobile: "09170778899", customerType: "Homeowner", projectType: "House repainting", location: "Brgy Obrero", materials: "Interior paint 15 cans, exterior paint 10 cans", message: "Whole house repaint - need color consultation and quote.", replied: true, staffNote: "Color consultation scheduled, quote sent" },
        { id: "SAMPLE-QUO-5", timestamp: new Date(now - 4*86400*1000).toISOString(), name: "Joel Reyes", mobile: "09170990011", customerType: "Hardware/Reseller", projectType: "Stock replenishment", location: "Calbayog City", materials: "Assorted electrical wires, PVC fittings, common nails", message: "Monthly stock order for hardware store.", replied: false, staffNote: "Compiling price list" }
      ];
      var sampleFeedback = [
        { id: "SAMPLE-FB-1", timestamp: new Date(now - 6000*1000).toISOString(), name: "Maria Santos", serviceType: "Delivery", rating: 5, comments: "Fast delivery and helpful staff." },
        { id: "SAMPLE-FB-2", timestamp: new Date(now - 86400*1000).toISOString(), name: "Juan Dela Cruz", serviceType: "Pickup", rating: 4, comments: "Items were ready on time." },
        { id: "SAMPLE-FB-3", timestamp: new Date(now - 2*86400*1000).toISOString(), name: "Ana Reyes", serviceType: "Product availability", rating: 5, comments: "Found the tank size we needed." },
        { id: "SAMPLE-FB-4", timestamp: new Date(now - 3*86400*1000).toISOString(), name: "Pedro Lim", serviceType: "Customer service", rating: 4, comments: "Clear pricing confirmation." },
        { id: "SAMPLE-FB-5", timestamp: new Date(now - 4*86400*1000).toISOString(), name: "Liza Gomez", serviceType: "Overall", rating: 3, comments: "Good selection, hoping for more stock updates." },
        { id: "SAMPLE-FB-6", timestamp: new Date(now - 5*86400*1000).toISOString(), name: "Robert Cruz", serviceType: "Delivery", rating: 5, comments: "Driver called ahead, delivered to exact location on site." },
        { id: "SAMPLE-FB-7", timestamp: new Date(now - 6*86400*1000).toISOString(), name: "Sarah Lim", serviceType: "Pickup", rating: 5, comments: "Very organized pickup counter. Staff knew my order immediately." },
        { id: "SAMPLE-FB-8", timestamp: new Date(now - 7*86400*1000).toISOString(), name: "Carla Tan", serviceType: "Product availability", rating: 4, comments: "Had the paint colors I wanted. Good stock on hand." },
        { id: "SAMPLE-FB-9", timestamp: new Date(now - 8*86400*1000).toISOString(), name: "BuildRight Co.", serviceType: "Overall", rating: 5, comments: "Reliable supplier for our projects. Consistent pricing and delivery." },
        { id: "SAMPLE-FB-10", timestamp: new Date(now - 9*86400*1000).toISOString(), name: "Joel Reyes", serviceType: "Customer service", rating: 4, comments: "Responsive to inquiries. Staff knowledgeable about products." }
      ];

      var existOrders = orders();
      var existInq = inquiries();
      var existQuotes = quotes();
      var existFb = feedback();
      sampleOrders.forEach(function (o) { o.id = o.ref; existOrders.unshift(o); });
      sampleInquiries.forEach(function (r) { existInq.unshift(r); });
      sampleQuotes.forEach(function (r) { existQuotes.unshift(r); });
      sampleFeedback.forEach(function (r) { existFb.unshift(r); });
      try {
        ECMStore.writeList("ecm_orders", existOrders);
        ECMStore.writeList("ecm_inquiries", existInq);
        ECMStore.writeList("ecm_quotes", existQuotes);
        ECMStore.writeList("ecm_feedback", existFb);
        setStatus("Sample data loaded (prefixed with SAMPLE).", true);
        toast("Sample data loaded");
        updateNewOrdersBadge();
      } catch (e) {
        setStatus("Could not load sample data in this browser.", false);
      }
    }

    if (loadBtn) loadBtn.addEventListener("click", function () {
      if (confirm("Load sample data? This will add 12 orders, 8 inquiries, 5 quotes, and 10 feedback entries (all prefixed with SAMPLE) to your current data. Continue?")) {
        loadSample();
      }
    });
    if (exportBtn) exportBtn.addEventListener("click", function () {
      try {
        var json = ECMStore.exportData();
        var blob = new Blob([json], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a"); a.href = url; a.download = "ecm-data-export.json";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        setStatus("Data exported to ecm-data-export.json.", true);
      } catch (e) { setStatus("Export failed.", false); }
    });
    if (importInput) importInput.addEventListener("change", function () {
      var file = importInput.files && importInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          ECMStore.importData(String(reader.result || "{}"));
          setStatus("Data imported. Reload pages to see updates.", true);
          toast("Data imported");
        } catch (e) { setStatus("Import failed. Please choose a valid JSON export.", false); }
      };
      reader.readAsText(file);
      importInput.value = "";
    });
    if (resetBtn) resetBtn.addEventListener("click", function () {
      if (!confirm("Reset all stored EC Marketing data on this device? This cannot be undone.")) return;
      try { ECMStore.clearAll(); } catch (e) {}
      setStatus("All ecm_* data cleared in this browser.", true);
      toast("Stored data reset");
    });
  }

  /* -------- Admin mobile drawer (below 1200px; header stays on desktop) -------- */
  function initAdminDrawer() {
    if (document.body.classList.contains("admin-login-page")) return;
    if (!document.body.hasAttribute("data-admin-page") && !location.pathname.includes("/admin/")) return;
    if (typeof bootstrap === "undefined") return;

    var hamburger = document.querySelector(".btn-mobile-hamburger");
    var drawer = document.getElementById("adminDrawer");
    if (!hamburger || !drawer) return;

    var offcanvas = new bootstrap.Offcanvas(drawer, { backdrop: true, keyboard: true });
    var navLinks = drawer.querySelectorAll(".admin-drawer-nav-link");
    var page = document.body.getAttribute("data-admin-page") || "";

    /* Theme toggle button in drawer (kept in sync with main.js applyTheme) */
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

    /* Set active page in drawer */
    navLinks.forEach(function (link) {
      var pageId = link.getAttribute("data-nav");
      if (pageId === page) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    drawer.addEventListener("shown.bs.offcanvas", function () {
      hamburger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var firstLink = drawer.querySelector('.admin-drawer-nav-link[aria-current="page"]') || drawer.querySelector(".admin-drawer-nav-link");
      if (firstLink) firstLink.focus();
    });

    drawer.addEventListener("hidden.bs.offcanvas", function () {
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      hamburger.focus();
    });

    hamburger.addEventListener("click", function () {
      offcanvas.toggle();
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        offcanvas.hide();
      });
    });

    /* Update Orders badge everywhere */
    function updateBadge() {
      var n = 0;
      try { n = orders().filter(function (o) { return (o.status || "New") === "New"; }).length; } catch (e) {}
      document.querySelectorAll(".adminNewOrdersBadge").forEach(function (b) {
        b.textContent = String(n);
        b.classList.toggle("d-none", n === 0);
      });
      var link = document.querySelector('[data-nav="orders"]');
      if (link) link.setAttribute("aria-label", "Orders" + (n ? ", " + n + " new" : ""));
      var drawerLink = drawer ? drawer.querySelector('.admin-drawer-nav-link[data-nav="orders"]') : null;
      if (drawerLink) drawerLink.setAttribute("aria-label", "Orders" + (n ? ", " + n + " new" : ""));
    }
    updateBadge();

    /* Expose for other modules */
    window.ECMAdmin = window.ECMAdmin || {};
    window.ECMAdmin.updateOrdersBadge = updateBadge;
  }

  /* -------- Page bootstrap -------- */
  document.addEventListener("DOMContentLoaded", function () {
    requireAuth();
    initAdminDrawer();
    var page = document.body.getAttribute("data-admin-page") || "";
    if (page === "login") initLogin();
    if (page === "dashboard") initDashboard();
    if (page === "products") initProducts();
    if (page === "orders") initOrders();
    if (page === "inquiries") initInquiries();
    if (page === "feedback") initFeedback();
    if (page === "settings") initSettings();
  });

  window.ECMAdmin = {
    credentials: ECM_ADMIN_CREDENTIALS,
    login: login,
    logout: logout,
    isAuthed: isAuthed,
    orderStatuses: ORDER_STATUSES
  };
})();
