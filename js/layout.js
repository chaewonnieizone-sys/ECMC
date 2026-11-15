(function () {
  "use strict";

  var HEADER_HTML = `
<header class="site-header">
  <div class="utility-bar py-1">
    <div class="container d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div class="d-flex flex-wrap align-items-center gap-3 small">
        <span><i class="bi bi-telephone me-1" aria-hidden="true"></i><a href="tel:+63555338161">(055) 533-8161</a></span>
        <span class="d-none d-md-inline"><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>Rosales Blvd, Barangay Central, Calbayog City</span>
        <span data-open-now>Mon–Fri 8:00 AM–5:00 PM · Sat 8:00 AM–1:00 PM</span>
      </div>
      <div class="small d-none d-md-flex"><span class="micro-label text-warning mb-0">Serving Calbayog since 2003</span></div>
    </div>
  </div>
  <nav class="navbar navbar-expand-xl navbar-main" aria-label="Main navigation">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold flex-shrink-0" href="index.html">
        <img src="images/logo.jpg" alt="EC Marketing Corporation logo" class="brand-logo" style="width:40px;height:40px">
        <span class="brand-text" style="white-space:nowrap;line-height:1.1;">EC Marketing Corporation</span>
      </a>
      <div class="site-search me-xl-3 my-2 my-xl-0 d-none d-xl-block" style="flex:0 1 auto;min-width:0;width:190px;">
        <i class="bi bi-search search-icon" aria-hidden="true"></i>
        <label for="siteSearch" class="visually-hidden">Search products and categories</label>
        <input id="siteSearch" class="form-control" type="search" placeholder="Search products" data-site-search autocomplete="off" style="border-radius:var(--radius-pill);padding-left:2.2rem;padding-right:.9rem;">
      </div>
      <ul class="navbar-nav d-none d-xl-flex flex-row align-items-center m-0 p-0" style="gap:.4rem;">
        <li class="nav-item"><a class="nav-link fw-semibold" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link fw-semibold" href="shop.html">Shop</a></li>
        <li class="nav-item"><a class="nav-link fw-semibold" href="quote.html">Bulk Quote</a></li>
        <li class="nav-item"><a class="nav-link fw-semibold" href="track.html">Track Order</a></li>
        <li class="nav-item dropdown">
          <a class="nav-link fw-semibold dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">More</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="how-to-order.html">How to Order</a></li>
            <li><a class="dropdown-item" href="about.html">About</a></li>
            <li><a class="dropdown-item" href="contact.html">Contact</a></li>
            <li><a class="dropdown-item" href="feedback.html">Feedback</a></li>
          </ul>
        </li>
      </ul>
      <div class="d-flex align-items-center gap-2 ms-auto ms-xl-0 order-xl-3 flex-shrink-0">
        <button id="themeToggle" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" type="button" aria-label="Toggle theme" data-theme-label style="height:40px;min-width:40px;white-space:nowrap;padding:.35rem .75rem;">
          <i class="bi bi-moon-stars" aria-hidden="true"></i><span class="d-none d-xxl-inline" data-theme-text>Dark</span>
        </button>
        <button class="btn btn-primary position-relative d-flex align-items-center gap-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas" aria-controls="cartOffcanvas" aria-label="Open cart" style="height:40px;white-space:nowrap;padding:.35rem .75rem;">
          <i class="bi bi-cart3" aria-hidden="true"></i><span class="d-none d-xl-inline">Cart</span>
          <span class="badge text-bg-warning cart-badge position-absolute top-0 start-100 translate-middle d-none" data-cart-count style="font-size:.65rem;">0</span>
        </button>
        <button class="btn btn-mobile-hamburger btn-outline-light d-xl-none" type="button" aria-label="Open menu" aria-controls="customerDrawer" aria-expanded="false" style="height:40px;min-width:40px;white-space:nowrap;">
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </nav>
</div>
`;

  var CART_OFFCANVAS_HTML = `
<div class="offcanvas offcanvas-end" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
  <div class="offcanvas-header"><h2 class="offcanvas-title h5" id="cartOffcanvasLabel"><i class="bi bi-cart3 me-2 text-primary" aria-hidden="true"></i>Your Cart</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
  <div class="offcanvas-body d-flex flex-column"><div id="offcanvasCartBody" class="flex-grow-1 overflow-auto" style="max-height: 45vh;"></div><div id="offcanvasCartFooter" class="small text-body-secondary mt-3 border-top pt-3"></div><div class="d-grid gap-2 mt-3"><a href="cart.html" class="btn btn-outline-primary">View Cart</a><a href="checkout.html" class="btn btn-primary">Checkout</a></div></div>
</div>
`;

  var FOOTER_HTML = `
<footer class="site-footer mt-0">
  <div class="container section-sm pb-4">
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="d-flex align-items-center gap-2 mb-2">
          <img src="images/logo.jpg" alt="EC Marketing Corporation logo" class="brand-logo">
          <span class="h5 mb-0 text-white">EC Marketing Corporation</span>
        </div>
        <p class="small mb-2" style="color:#D8CEC7">Wholesale and retail construction and hardware supplier in Calbayog City, Samar.</p>
        <p class="small mb-3" style="color:#D8CEC7">Registered as Calbayog E.C. Marketing, Incorporated · SEC No. CS2003640383</p>
        <p class="small mb-3 tagline-echo" style="color:#D8CEC7;max-width:28rem;font-size:.875rem;line-height:1.5;">The Calbayognon First and Best Choice in Homeware and Construction Materials</p>
        <div class="visit-card p-3">
          <div class="micro-label text-warning mb-1">Visit us</div>
          <div class="small" style="color:#F6EFEA">LGK Building, Rosales Blvd, Barangay Central, Calbayog City, Samar 6710</div>
          <div class="small mt-1" style="color:#D8CEC7">Mon–Fri 8:00 AM–5:00 PM · Sat 8:00 AM–1:00 PM</div>
        </div>
      </div>
      <div class="col-6 col-lg-2">
        <h3 class="footer-title mb-2">Quick links</h3>
        <ul class="list-unstyled small mb-0">
          <li class="mb-1"><a href="shop.html">Shop</a></li>
          <li class="mb-1"><a href="quote.html">Bulk Quote</a></li>
          <li class="mb-1"><a href="how-to-order.html">How to Order</a></li>
          <li class="mb-1"><a href="track.html">Track order</a></li>
          <li class="mb-1"><a href="about.html">About</a></li>
          <li class="mb-1"><a href="contact.html">Contact</a></li>
          <li class="mb-1"><a href="feedback.html">Feedback</a></li>
        </ul>
      </div>
      <div class="col-6 col-lg-2">
        <h3 class="footer-title mb-2">Categories</h3>
        <ul class="list-unstyled small mb-0">
          <li class="mb-1"><a href="shop.html?category=Construction%20materials">Construction materials</a></li>
          <li class="mb-1"><a href="shop.html?category=Water%20tanks">Water tanks</a></li>
          <li class="mb-1"><a href="shop.html?category=Power%20tools">Power tools</a></li>
          <li class="mb-1"><a href="shop.html?category=Hardware%20%26%20paint">Hardware & paint</a></li>
        </ul>
      </div>
      <div class="col-lg-4">
        <h3 class="footer-title mb-2">Contact</h3>
        <ul class="list-unstyled small mb-3" style="color:#D8CEC7">
          <li class="mb-1"><a href="tel:+63555338161">(055) 533-8161</a> · <a href="tel:+639171341638">+63 917 134 1638</a></li>
          <li class="mb-1"><a href="mailto:info@calbayogec.com">info@calbayogec.com</a></li>
          <li class="mb-1"><a href="https://www.facebook.com/" target="_blank" rel="noopener">Calbayog EC Marketing (Facebook)</a></li>
        </ul>
        <div class="d-flex flex-wrap gap-2">
          <a href="tel:+639171341638" class="btn btn-sm btn-outline-light">Call</a>
          <a href="sms:+639171341638" class="btn btn-sm btn-outline-light">Text</a>
          <a href="mailto:info@calbayogec.com" class="btn btn-sm btn-outline-light">Email</a>
        </div>
        <div class="mt-3"><button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="modal" data-bs-target="#privacyModal">Data Privacy Notice</button></div>
      </div>
    </div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top border-secondary">
      <p class="small mb-0" style="color:#D8CEC7">&copy; <span id="year"></span> EC Marketing Corporation. All rights reserved.</p>
      <a class="small text-decoration-none" href="admin/login.html" style="color:#D8CEC7" data-admin-hide>Staff login</a>
    </div>
  </div>
</footer>
`;

  var MOBILE_ACTION_BAR_HTML = `
<div class="mobile-action-bar" aria-label="Quick actions">
  <a href="tel:+639171341638" class="btn btn-outline-light"><i class="bi bi-telephone" aria-hidden="true"></i><span class="d-block">Call</span></a>
  <a href="sms:+639171341638" class="btn btn-outline-light"><i class="bi bi-chat-dots" aria-hidden="true"></i><span class="d-block">Text</span></a>
  <a href="cart.html" class="btn btn-warning text-dark"><i class="bi bi-cart3" aria-hidden="true"></i><span class="d-block">Cart</span></a>
  <a href="quote.html" class="btn btn-primary"><i class="bi bi-file-earmark-text" aria-hidden="true"></i><span class="d-block">Quote</span></a>
</div>
`;

  var PRIVACY_MODAL_HTML = `
<div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header"><h2 class="modal-title h5" id="privacyModalLabel">Data Privacy Notice</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body">
        <p>EC Marketing Corporation collects personal information you provide in forms (such as name, contact details, address, company, and order or inquiry details) to process your order, quote, inquiry, or feedback.</p>
        <p class="mb-0">Information is used only for that purpose and handled in accordance with Republic Act No. 10173 (Data Privacy Act of 2012). Your cart and submitted records are stored in this browser on this device; if email notifications are configured, order details may be sent to the shop by email.</p>
      </div>
    </div>
  </div>
</div>
`;

  var TOAST_CONTAINER_HTML = `
<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer"></div>
`;

  var ADMIN_HEADER_HTML = `
<header class="site-header admin-header d-none d-xl-flex">
  <nav class="navbar navbar-expand-xl navbar-main" aria-label="Admin navigation">
    <div class="container-xxl">
      <!-- Brand (desktop) -->
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold flex-shrink-0" href="dashboard.html">
        <img src="../images/logo.jpg" alt="EC Marketing Corporation" class="brand-logo" style="width:36px;height:36px">
        <span class="brand-text d-flex flex-column" style="white-space:nowrap;line-height:1.1;">
          <span class="d-none d-sm-inline">EC Marketing Corporation</span>
          <span class="d-sm-none">EC Marketing Corporation</span>
        </span>
        <span class="badge text-bg-warning text-dark ms-2 d-none d-xl-inline">Staff Portal</span>
      </a>
      <!-- Center nav links -->
      <div class="d-none d-xl-flex flex-grow-1 ms-auto me-auto justify-content-center">
        <ul class="navbar-nav admin-desktop-nav flex-row align-items-center m-0 p-0" style="gap:.25rem;">
          <li class="nav-item"><a class="nav-link admin-nav-link d-flex align-items-center gap-2" data-admin-nav="dashboard" href="dashboard.html"><i class="bi bi-speedometer2" aria-hidden="true"></i><span>Dashboard</span></a></li>
          <li class="nav-item"><a class="nav-link admin-nav-link d-flex align-items-center gap-2" data-admin-nav="products" href="products.html"><i class="bi bi-box-seam" aria-hidden="true"></i><span>Products</span></a></li>
          <li class="nav-item"><a class="nav-link admin-nav-link d-flex align-items-center gap-2" data-admin-nav="orders" href="orders.html"><i class="bi bi-receipt" aria-hidden="true"></i><span>Orders</span> <span id="adminNewOrdersBadge" class="badge text-bg-danger ms-1 adminNewOrdersBadge">0</span></a></li>
          <li class="nav-item"><a class="nav-link admin-nav-link d-flex align-items-center gap-2" data-admin-nav="inquiries" href="inquiries.html"><i class="bi bi-chat-dots" aria-hidden="true"></i><span>Inquiries</span></a></li>
          <li class="nav-item"><a class="nav-link admin-nav-link d-flex align-items-center gap-2" data-admin-nav="feedback" href="feedback.html"><i class="bi bi-star" aria-hidden="true"></i><span>Feedback</span></a></li>
          <li class="nav-item"><a class="nav-link admin-nav-link d-flex align-items-center gap-2" data-admin-nav="settings" href="settings.html"><i class="bi bi-gear" aria-hidden="true"></i><span>Settings</span></a></li>
        </ul>
      </div>
      <!-- Right actions -->
      <div class="d-none d-xl-flex align-items-center gap-2 flex-shrink-0">
        <button class="btn btn-sm btn-outline-secondary rounded-circle theme-toggle" type="button" aria-label="Toggle theme" data-theme-toggle data-theme-label style="width:36px;height:36px;padding:0;">
          <i class="bi bi-moon-stars" aria-hidden="true"></i>
        </button>
        <a class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" href="../index.html" style="height:36px;white-space:nowrap;padding:.35rem .75rem;">
          <i class="bi bi-shop" aria-hidden="true"></i><span class="d-none d-xxl-inline">View store</span>
        </a>
        <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-2" id="adminLogout" type="button" style="height:36px;white-space:nowrap;padding:.35rem .75rem;">
          <i class="bi bi-box-arrow-right" aria-hidden="true"></i><span class="d-none d-xxl-inline">Logout</span>
        </button>
      </div>
    </div>
  </nav>
</header>

<!-- Mobile top bar (< 1200px) -->
<header class="site-header admin-header-mobile d-xl-none">
  <button type="button" class="btn btn-mobile-hamburger" aria-label="Open menu" aria-controls="adminDrawer" aria-expanded="false">
    <i class="bi bi-list" aria-hidden="true"></i>
  </button>
  <a href="dashboard.html" class="admin-mobile-logo" aria-label="EC Marketing Corporation">
    <img src="../images/logo.jpg" alt="" class="brand-logo">
  </a>
  <a href="dashboard.html" class="admin-mobile-text" aria-label="EC Marketing Corporation">EC Marketing Corporation</a>
</header>

<!-- Mobile admin drawer (direct child of body, below 1200px) -->
<div class="offcanvas offcanvas-start" id="adminDrawer" tabindex="-1" aria-labelledby="adminDrawerTitle">
  <div class="offcanvas-header">
    <img src="../images/logo.jpg" alt="" class="drawer-logo">
    <span class="drawer-title">Admin menu</span>
    <span class="staff-portal-pill badge text-bg-warning text-dark">Staff Portal</span>
    <button type="button" class="drawer-close" data-bs-dismiss="offcanvas" aria-label="Close menu">
      <i class="bi bi-x" aria-hidden="true"></i>
    </button>
  </div>
  <div class="offcanvas-body admin-drawer-body">
    <ul class="admin-drawer-nav" role="list">
      <li><a class="admin-drawer-nav-link" data-nav="dashboard" href="dashboard.html"><i class="bi bi-speedometer2" aria-hidden="true"></i><span class="admin-drawer-nav-label">Dashboard</span></a></li>
      <li><a class="admin-drawer-nav-link" data-nav="products" href="products.html"><i class="bi bi-box-seam" aria-hidden="true"></i><span class="admin-drawer-nav-label">Products</span></a></li>
      <li><a class="admin-drawer-nav-link" data-nav="orders" href="orders.html"><i class="bi bi-receipt" aria-hidden="true"></i><span class="admin-drawer-nav-label">Orders</span> <span class="badge text-bg-danger admin-drawer-badge adminNewOrdersBadge d-none">0</span></a></li>
      <li><a class="admin-drawer-nav-link" data-nav="inquiries" href="inquiries.html"><i class="bi bi-chat-dots" aria-hidden="true"></i><span class="admin-drawer-nav-label">Inquiries</span></a></li>
      <li><a class="admin-drawer-nav-link" data-nav="feedback" href="feedback.html"><i class="bi bi-star" aria-hidden="true"></i><span class="admin-drawer-nav-label">Feedback</span></a></li>
      <li><a class="admin-drawer-nav-link" data-nav="settings" href="settings.html"><i class="bi bi-gear" aria-hidden="true"></i><span class="admin-drawer-nav-label">Settings</span></a></li>
    </ul>
  </div>
  <div class="drawer-footer">
    <button type="button" class="drawer-action drawer-action-theme" data-theme-toggle data-theme-label aria-label="Toggle theme"><i class="bi bi-moon-stars" aria-hidden="true"></i><span class="drawer-action-label" data-theme-text>Dark</span></button>
    <a href="../index.html" class="drawer-action" aria-label="View store"><i class="bi bi-shop" aria-hidden="true"></i><span class="drawer-action-label">View store</span></a>
    <button type="button" class="drawer-action drawer-action-logout" id="adminDrawerLogout" aria-label="Logout"><i class="bi bi-box-arrow-right" aria-hidden="true"></i><span class="drawer-action-label">Logout</span></button>
    <p class="drawer-demo small text-body-secondary">Demo admin: data is stored only in this browser and this login is not secure.</p>
  </div>
</div>
`;

  function injectLayout() {
    var isLogin = document.body.classList.contains("admin-login-page");
    if (isLogin) return;

    var isAdmin = document.body.hasAttribute("data-admin-page") || location.pathname.includes("/admin/");
    var headerHtml = isAdmin ? ADMIN_HEADER_HTML : HEADER_HTML;

    // For admin pages, the header is now desktop-only (d-none d-xl-flex)
    // The mobile sidebar is injected by admin.js
    var headerPlaceholder = document.getElementById("layout-header");
    if (headerPlaceholder) {
      headerPlaceholder.outerHTML = headerHtml;
    } else {
      var firstMain = document.querySelector("main") || document.body.firstChild;
      if (firstMain) {
        var temp = document.createElement("div");
        temp.innerHTML = headerHtml;
        document.body.insertBefore(temp.firstElementChild, firstMain);
      }
    }

    var cartOffcanvasPlaceholder = document.getElementById("layout-cart-offcanvas");
    if (!isAdmin) {
      if (cartOffcanvasPlaceholder) {
        cartOffcanvasPlaceholder.outerHTML = CART_OFFCANVAS_HTML;
      } else if (!document.getElementById("cartOffcanvas")) {
        document.body.insertAdjacentHTML("beforeend", CART_OFFCANVAS_HTML);
      }
    }

    var footerPlaceholder = document.getElementById("layout-footer");
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = isAdmin ? FOOTER_HTML.replace('src="images/logo.jpg"', 'src="../images/logo.jpg"') : FOOTER_HTML;
    } else {
      var footerEl = document.querySelector("footer.site-footer");
      if (footerEl) footerEl.outerHTML = isAdmin ? FOOTER_HTML.replace('src="images/logo.jpg"', 'src="../images/logo.jpg"') : FOOTER_HTML;
      else document.body.insertAdjacentHTML("beforeend", isAdmin ? FOOTER_HTML.replace('src="images/logo.jpg"', 'src="../images/logo.jpg"') : FOOTER_HTML);
    }

    // Remove admin-hidden elements on admin pages
    if (isAdmin) {
      document.querySelectorAll("[data-admin-hide]").forEach(function(el) { el.remove(); });
    }

    // Only inject mobile action bar on storefront pages (not admin)
    if (!isAdmin) {
      var mobileBarPlaceholder = document.getElementById("layout-mobile-bar");
      if (mobileBarPlaceholder) {
        mobileBarPlaceholder.outerHTML = MOBILE_ACTION_BAR_HTML;
      } else if (!document.querySelector(".mobile-action-bar")) {
        document.body.insertAdjacentHTML("beforeend", MOBILE_ACTION_BAR_HTML);
      }
    }

    if (!document.getElementById("privacyModal")) {
      document.body.insertAdjacentHTML("beforeend", PRIVACY_MODAL_HTML);
      // Fix aria-hidden accessibility issue on privacy modal
      var pm = document.getElementById("privacyModal");
      if (pm) {
        pm.addEventListener('show.bs.modal', function () { pm.setAttribute('aria-hidden', 'false'); });
        pm.addEventListener('hidden.bs.modal', function () { pm.setAttribute('aria-hidden', 'true'); });
      }
    }

    if (!document.getElementById("toastContainer")) {
      document.body.insertAdjacentHTML("beforeend", TOAST_CONTAINER_HTML);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectLayout);
  } else {
    injectLayout();
  }

  window.ECMLayout = { injectLayout: injectLayout };
})();
