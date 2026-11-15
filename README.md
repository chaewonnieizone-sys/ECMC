# EC Marketing Corporation E-Commerce Website

Multi-page e-commerce website for **EC Marketing Corporation** (registered as Calbayog E.C. Marketing, Incorporated), a wholesale and retail construction and hardware supplier in Calbayog City, Samar, Philippines.

## Tech stack
- **HTML5, CSS3, vanilla JavaScript** (no React, Vue, or jQuery)
- **Bootstrap 5.3.3** loaded locally from `/vendor/bootstrap/` with pinned CDN fallback (`onerror`)
- Bootstrap JS bundle used for navbar toggler, offcanvas, modal, carousel, tabs, and toasts
- Google Fonts: **Bricolage Grotesque** (headings), **Figtree** (body) with fallback stacks
- No backend / no online payment processing: checkout, quote, contact, feedback, and inquiry submissions are saved in the browser and can generate Copy/SMS/Email messages for shop follow-up

## How to open the site
1. Ensure the full folder structure is preserved (especially `vendor/bootstrap/`, `css/`, `js/`, `images/`, and `admin/`).
2. Open `index.html` in a browser, or serve the folder with a local server (e.g. XAMPP at `http://localhost/EC/` or `python -m http.server`).
3. No build step is required. Orders, inquiries, quotes, and feedback are saved in this browser and visible in the staff portal on this device. Delivery of order notifications to the shop by email requires the optional EmailJS setup (see below). No online payments are collected.

## File structure
- Storefront: `index.html`, `shop.html`, `product.html`, `cart.html`, `checkout.html`, `order-success.html`, `quote.html`, `how-to-order.html`, `about.html`, `contact.html`, `feedback.html`, `track.html`
- Staff portal: `admin/login.html`, `admin/dashboard.html`, `admin/products.html`, `admin/orders.html`, `admin/inquiries.html`, `admin/feedback.html`, `admin/settings.html`
- `css/style.css` – theme variables and custom styling (shared by storefront and staff portal)
- `js/products.js` – product seed data, option/variant model, aliases, and catalog helpers
- `js/cart.js` – selection-aware cart storage/operations with `localStorage` + in-memory fallback (`ecm_cart`)
- `js/store.js` – shared front-end data layer (`ecm_products`, `ecm_orders`, `ecm_inquiries`, `ecm_quotes`, `ecm_feedback`, `ecm_events`) with try/catch + in-memory fallback, seeding/sync, CRUD, export/import/reset
- `js/config.js` – optional EmailJS configuration (OFF by default; no external script/network requests when empty)
- `js/main.js` – theme toggle, shared UI, quick-add options modal, offcanvas cart, validation helpers, analytics hooks, event recording
- `js/admin.js` – staff portal auth/session, dashboard KPIs, products/orders/inquiries/feedback/settings logic, sample data
- `vendor/bootstrap/bootstrap.min.css`, `vendor/bootstrap/bootstrap.bundle.min.js`
- `images/` – logo, favicon, product images and placeholders

## Shared layout method
**Repeated markup** is used for the navbar, offcanvas cart, footer, privacy modal, and toast container on storefront pages (kept consistent across files). Shared behavior is centralized in `js/main.js`, `js/cart.js`, and `js/store.js` (theme, cart, data persistence, validation/copy helpers, event tracking). Staff portal pages use a matching theme/logo/dark toggle with a Bootstrap sidebar/offcanvas navigation.

## Staff portal
- **Entry points:** footer “Staff login” on storefront pages, or open `admin/login.html` directly.
- **Default credentials (in `js/admin.js`):** username `admin`, password `ecm2026`
- **To change credentials:** edit `ECM_ADMIN_CREDENTIALS` near the top of `js/admin.js`:
  ```js
  var ECM_ADMIN_CREDENTIALS = { username: "admin", password: "ecm2026" };
  ```
- **Auth behavior:** successful login sets a `sessionStorage` flag (`ecm_admin_auth`); every admin page checks and redirects to login if missing; Logout clears the flag.

## Walkthrough flow
1. **Storefront overview:** Open `index.html`. Show branding, responsive layout, light/dark toggle, catalog/shop navigation, and business info (Calbayog, contact, hours, free delivery/COD terms confirmed by the shop).
2. **Browse & cart:** Open `shop.html`/`product.html`. Show configurable options/variants, “Add to cart” (quick-add for configurable items), offcanvas/cart updates, and selection-aware pricing/details.
3. **Place an order:** Go to `checkout.html`, fill required details (including privacy consent), click **Place order**. Show redirect to `order-success.html` with reference, order summary, status stepper, “Track my order”, print slip, and optional “Send by text / Send by email / Copy order message” actions.
4. **Staff portal:** Login at `admin/login.html`. Show the **New** orders badge, dashboard alerts/KPIs, and the new order in `orders.html`. Open it, confirm/update status (timeline/note/pickup/delivered) and save. Review products, inquiries, quotes, and feedback as needed.
5. **Track order:** Open `track.html` or follow the tracking link to view updated status by reference number and mobile number.

## Feature-to-plan mapping

| Feature | Strategic Marketing Plan recommendation supported |
|---|---|
| Dashboard KPIs (orders, new awaiting confirmation, inquiries, bulk quotes, avg feedback, low/out-of-stock) | KPI monitoring for sales/orders, inquiries, and customer feedback |
| Plan KPI panel (sales count/value when prices exist, inquiries, orders, feedback, repeat purchases by mobile) | Measurement of online ordering, inquiry response, feedback, and repeat-customer signals |
| Orders management with statuses, timeline, staff notes, pickup/delivery marks, print slip | Order confirmation, fulfillment coordination, and delivery/pickup tracking workflow |
| Product catalog management (add/edit/delete, price/Ask for price, stock, badges, quick stock toggle) | Product availability/price maintenance and catalog accuracy |
| Inquiries & bulk quotes tracking (pending/replied, staff notes, materials list) | Inquiry handling and contractor/store bulk-quote service |
| Feedback list with ratings and averages by service type | Customer feedback collection for service improvement |
| Customer tracking page (`track.html`, ref + mobile, stepper/timeline) | Transparent order-status communication in the digital journey |
| Sample data, export/import JSON, reset stored data | Data management and controlled setup/restore of records |
| Shared browser data layer synced with storefront | Coordinated front-end view of inventory/ordering/inquiry records |

## Data handling & privacy (RA 10173)
- **Front-end storage:** checkout, quote, contact, product inquiry, and feedback submissions are saved in this browser (`localStorage`, with in-memory fallback) and are visible in the staff portal on this device. The site indicates the shop has received an order notification by email only when **EmailJS is configured and the send succeeded** (see below).
- **Browser-local storage:** keys include `ecm_cart`, `ecm_products`, `ecm_orders`, `ecm_inquiries`, `ecm_quotes`, `ecm_feedback`, `ecm_events` (and admin-seen marker). Clearing browser data or switching device/browser removes or isolates data.
- **Tracking:** `track.html` matches orders saved in the same browser by reference + mobile.
- **Privacy:** collect and handle personal information only as needed for order processing, inquiries, and service follow-up in accordance with Republic Act No. 10173 (Data Privacy Act of 2012).

## Optional email notification (EmailJS, OFF by default)
EmailJS can optionally notify the shop by email **after** an order is saved. It is **disabled by default**: when not configured, no EmailJS script is loaded and no network requests are made. If configured but sending fails or you are offline, the order is **still saved** and the success page shows that email notification could not be sent.

### Configure `js/config.js`
1. **Create an EmailJS account:** go to [https://www.emailjs.com/](https://www.emailjs.com/) and sign up.
2. **Add an Email Service:** in the EmailJS dashboard, add/connect an email service (e.g. Gmail) and note the **Service ID**.
3. **Create an Email Template:** create a template and include the variables this site sends:
   - `{{to_email}}` (recipient, `info@calbayogec.com`)
   - `{{order_ref}}`, `{{customer_name}}`, `{{customer_mobile}}`, `{{customer_email}}`, `{{customer_type}}`, `{{company}}`
   - `{{delivery_method}}`, `{{address}}`, `{{payment}}`
   - `{{items}}`, `{{subtotal}}`, `{{notes}}`
   - `{{order_message}}` (full formatted message), `{{timestamp}}`
   Set the template “To” field to `{{to_email}}` (or your chosen recipient) and save the **Template ID**.
4. **Copy your Public Key:** from EmailJS Account/API settings, copy the **Public Key**.
5. **Fill in `js/config.js`:**
   ```js
   var EMAILJS = {
     serviceId: "YOUR_SERVICE_ID",
     templateId: "YOUR_TEMPLATE_ID",
     publicKey: "YOUR_PUBLIC_KEY"
   };
   ```
   When all three are non-empty, checkout loads the pinned EmailJS browser script from jsDelivr and attempts to send after the order is saved. Leave them empty (`""`) to keep EmailJS off.
6. **Test:** place an order; on success the confirmation states the shop was notified by email only if EmailJS is configured **and** the send succeeded. If it fails, the notice appears but the order remains saved.

## Editing products and prices
- Edit `js/products.js` (`PRODUCTS_SEED`) for default catalog/options/variants/aliases, or use **Staff Portal > Products** for browser-local edits (stored in `ecm_products`, overrides seed in that browser).
- `price` can be a **number** (pesos) or `null`/blank for **“Ask for price”**. Cart totals show a numeric subtotal only when all cart items have numeric prices; otherwise **“Prices will be confirmed by the shop”**.
- Storefront reads products via store/helpers so product edits reflect on storefront pages in the same browser.

## Changing theme colors
Edit CSS variables in `css/style.css`:
- Light/base: `:root, [data-bs-theme="light"]` – `--bs-primary` (#D61F1F), `--bs-primary-rgb`, `--bs-warning` (#F5B400), `--bs-body-bg`, `--bs-body-color`, `--bs-border-color`, plus `--ecm-surface`, `--ecm-hero`
- Dark: `[data-bs-theme="dark"]` – `--bs-body-bg` (#171212), `--ecm-surface` (#261D1D), `--bs-body-color` (#F6EFEA), `--bs-primary` (#FF5A4F), `--bs-border-color` (#473434)
- Theme toggle uses Bootstrap `data-bs-theme`, persists choice in `localStorage` (try/catch), and defaults to system preference.

## Storefront feature mapping

| Website feature | Strategic Marketing Plan recommendation supported |
|---|---|
| Organized catalog with categories, search, filters (category/brand/audience), sort, pagination | Product discovery and accessible digital browsing for target customers |
| Product detail pages with options/variants, inquiry modal, specs, related products | Inquiry and pre-purchase information/availability clarification |
| "Ask for price" support with shop-confirmed pricing | Price and availability confirmation step (no invented pricing) |
| Cart (offcanvas + page), quantity controls, selection-aware persistence | Online ordering convenience and order preparation |
| Checkout with validated details, reference number, Copy/SMS/Email order message, saved record | Ordering, payment/COD preference capture, and shop-confirmed fulfillment flow |
| Bulk/contractor quote form with dynamic material rows | Service for contractors, construction companies, and stores/resellers |
| "How to Order" 7-step journey and FAQ | Clear digital customer journey communication (discover → feedback) |
| Contact page with details, validated inquiry, map placeholder/link | Inquiry access and strengthened customer communication |
| Feedback form and empty-state (no fake reviews) | Feedback collection for service improvement |
| About page (history, vision, mission, brands, eco practice, SEC) | Trust, brand credibility, and company values |
| Free delivery/COD messaging with "terms confirmed by the shop" | Communicates existing practices without inventing terms |
| No-single-use-plastic practice highlighted | Eco-friendly store practice |
| Light/dark mode, responsive layout, accessibility features | Usable experience across devices and preferences |
| `trackEvent` hooks, `dataLayer`, and local event log (`ecm_events`) | KPI monitoring readiness (sales/orders/inquiries/feedback/repeat signals) |

## KPI and event list
`trackEvent(name, data)` (in `js/main.js`) logs to console, pushes to `window.dataLayer`, forwards to `gtag`/`fbq` if loaded, and appends to `ECMStore` events (`ecm_events`) when available. No external tracking scripts are loaded by default.

| KPI (plan) | Events feeding it | Where triggered |
|---|---|---|
| Product interest / discovery | `product_view` | `product.html` on load (`id`, `name`) |
| Online cart intent | `add_to_cart` | `js/cart.js` on add (`id`, `qty`, selections) |
| Inquiries | `inquiry_sent` | Product availability modal and Contact form |
| Quote requests (contractors/stores) | `quote_request` | `quote.html` submit |
| Online orders prepared | `order_message_prepared` | `checkout.html` submit (`ref`, `items`) |
| Feedback | `feedback_submitted` | `feedback.html` submit (`rating`, `service`) |
| Sales / repeat purchases | Saved orders in staff portal/dashboard KPIs (repeat by mobile) | Available from stored order records |

### Analytics configuration (optional, disabled by default)
Edit `js/main.js` and set IDs in `window.ECM_ANALYTICS` (or set them before `js/main.js` loads):
```js
window.ECM_ANALYTICS = { gaId: "G-XXXXXXXXXX", metaPixelId: "1234567890" };
```
- **GA4:** when `gaId` is set, `gtag.js` is loaded and configured; `trackEvent` calls are sent via `gtag('event', ...)`.
- **Meta Pixel:** when `metaPixelId` is set, the Pixel is initialized and `PageView` is tracked; `trackEvent` calls are sent via `fbq('trackCustom', ...)`.
- Leave IDs empty (`""`) to keep analytics off (default).

## Owner follow-up items
- **Verify/update prices, brands, and model numbers** in `js/products.js` (or via Staff Portal > Products) to match actual stock and current pricing.
- **Real product photos** to replace remaining labeled placeholder JPGs in `images/` (Bosch tools and Bestank/Firstank tanks already use real JPGs).
- **Confirmed delivery terms** (coverage areas, conditions, fees/minimums if any) — site currently states "Free delivery and cash on delivery, terms confirmed by the shop".
- **Ceiling and wall panel specifications** (sizes, materials, brands, availability) and pricing/photos.
- **Official Facebook page URL** to replace the placeholder link.
- **Optional:** Google Analytics 4 ID and/or Meta Pixel ID in `js/main.js` (`ECM_ANALYTICS`) if you want external tracking enabled (off by default).
- **For production/server-backed operations:** backend/database, secure server-side authentication, real payment/order processing integration, and a production privacy/consent implementation appropriate for live personal data handling.
