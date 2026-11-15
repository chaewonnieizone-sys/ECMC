import re

with open('css/style.css', 'r') as f:
    content = f.read()

old_start = '/* =========================\n   Customer Sidebar (mobile < 1200px)\n   ========================= */'
new_css = '''/* =========================
   Customer Sidebar (mobile < 1200px)
   ========================= */
.customer-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100dvh;
  z-index: 1040;
  background: var(--bs-body-bg);
  border-right: 1px solid var(--bs-border-color);
  box-shadow: var(--shadow-lg);
  width: var(--customer-rail-width, 60px);
  transition: width var(--dur-base) var(--ease-out);
  display: flex;
  flex-direction: column;
}
[data-bs-theme="dark"] .customer-sidebar {
  background: #1F1818;
  border-right-color: var(--bs-border-color);
}
.customer-sidebar.expanded {
  width: var(--customer-expanded-width, 260px);
}
.customer-sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* Header - 64px, logo+text left, toggle right */
.customer-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 64px;
  border-bottom: 1px solid var(--bs-border-color);
  flex-shrink: 0;
}
.customer-sidebar-brand {
  display: flex;
  align-items: center;
  gap: .6rem;
  text-decoration: none;
  color: var(--ecm-charcoal);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
  min-width: 0;
}
.customer-sidebar-brand .brand-logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}
.customer-sidebar-brand-text {
  display: none;
}
.customer-sidebar.expanded .customer-sidebar-brand-text {
  display: inline;
}
.customer-sidebar-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: .5rem;
  background: transparent;
  border: none;
  color: var(--ecm-text);
  flex-shrink: 0;
  transition: background-color var(--dur-fast), color var(--dur-fast);
}
.customer-sidebar-toggle:hover,
.customer-sidebar-toggle:focus {
  background: var(--ecm-neutral-100);
  color: var(--ecm-text);
}
[data-bs-theme="dark"] .customer-sidebar-toggle:hover,
[data-bs-theme="dark"] .customer-sidebar-toggle:focus {
  background: var(--ecm-neutral-800);
}
.customer-sidebar-toggle:focus-visible {
  outline: 2px solid var(--ecm-gold);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--ecm-charcoal);
}
[data-bs-theme="dark"] .customer-sidebar-toggle:focus-visible {
  box-shadow: 0 0 0 2px #120E0E;
}
.customer-sidebar-toggle i {
  font-size: 1.25rem;
  transition: transform var(--dur-fast) var(--ease-out);
}
.customer-sidebar.expanded .customer-sidebar-toggle i {
  transform: rotate(180deg);
}

/* Nav list - flex: 1, scrolls internally */
.customer-sidebar-nav {
  list-style: none;
  margin: 0;
  padding: .5rem 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--bs-border-color) transparent;
}
.customer-sidebar-nav::-webkit-scrollbar {
  width: 6px;
}
.customer-sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}
.customer-sidebar-nav::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color);
  border-radius: 3px;
}

/* Nav link row - flex-start, fixed icon box, gap .85rem */
.customer-sidebar-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: .85rem;
  width: 100%;
  min-height: 48px;
  padding: 0 1rem 0 1.25rem;
  color: var(--ecm-text);
  text-decoration: none;
  border-radius: 0 12px 12px 0;
  position: relative;
  transition: background-color var(--dur-fast), color var(--dur-fast);
}
.customer-sidebar-link:hover {
  background: var(--ecm-neutral-100);
  color: var(--ecm-text);
}
[data-bs-theme="dark"] .customer-sidebar-link:hover {
  background: var(--ecm-neutral-800);
}
.customer-sidebar-link:focus-visible {
  outline: none;
  box-shadow: inset 2px 0 0 0 var(--ecm-gold), inset 4px 0 0 0 var(--ecm-charcoal);
}
[data-bs-theme="dark"] .customer-sidebar-link:focus-visible {
  box-shadow: inset 2px 0 0 0 var(--ecm-gold), inset 4px 0 0 0 #120E0E;
}

/* Icon box - fixed 24x24 */
.customer-sidebar-link > i {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  text-align: center;
  flex-shrink: 0;
}

/* Label */
.customer-sidebar-link-text {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  flex: 1 1 auto;
  text-align: left;
}

/* Active state - only one page at a time */
.customer-sidebar-link[aria-current="page"] {
  background: rgba(214,31,31,.08);
  color: var(--ecm-red);
}
.customer-sidebar-link[aria-current="page"]::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--ecm-red);
  border-radius: 0 12px 12px 0;
}
[data-bs-theme="dark"] .customer-sidebar-link[aria-current="page"] {
  background: rgba(255,90,79,.14);
  color: #FF5A4F;
}
[data-bs-theme="dark"] .customer-sidebar-link[aria-current="page"]::before {
  background: #FF5A4F;
}

/* Divider between groups */
.customer-sidebar-nav .nav-divider {
  height: 1px;
  background: var(--bs-border-color);
  margin: .5rem 1.25rem;
  flex-shrink: 0;
}

/* Footer - compact rows, same alignment */
.customer-sidebar-footer {
  padding: .5rem 0 calc(.5rem + env(safe-area-inset-bottom));
  border-top: 1px solid var(--bs-border-color);
  display: flex;
  flex-direction: column;
  gap: .25rem;
  flex-shrink: 0;
}
.customer-sidebar-action {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: .85rem;
  width: 100%;
  min-height: 44px;
  padding: 0 1rem 0 1.25rem;
  border-radius: 0 12px 12px 0;
  color: var(--ecm-text);
  text-decoration: none;
  background: transparent;
  border: none;
  transition: background-color var(--dur-fast), color var(--dur-fast);
}
.customer-sidebar-action:hover {
  background: var(--ecm-neutral-100);
  color: var(--ecm-text);
}
[data-bs-theme="dark"] .customer-sidebar-action:hover {
  background: var(--ecm-neutral-800);
}
.customer-sidebar-action:focus-visible {
  outline: none;
  box-shadow: inset 2px 0 0 0 var(--ecm-gold), inset 4px 0 0 0 var(--ecm-charcoal);
}
[data-bs-theme="dark"] .customer-sidebar-action:focus-visible {
  box-shadow: inset 2px 0 0 0 var(--ecm-gold), inset 4px 0 0 0 #120E0E;
}
.customer-sidebar-action > i {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  text-align: center;
  flex-shrink: 0.
}
.customer-sidebar-action .customer-sidebar-link-text {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  flex: 1 1 auto;
  text-align: left.
}

/* Collapsed rail (when not expanded) */
.customer-sidebar:not(.expanded) .customer-sidebar-brand-text,
.customer-sidebar:not(.expanded) .customer-sidebar-link-text,
.customer-sidebar:not(.expanded) .customer-sidebar-action .customer-sidebar-link-text {
  display: none;
}
.customer-sidebar:not(.expanded) .customer-sidebar-link,
.customer-sidebar:not(.expanded) .customer-sidebar-action {
  justify-content: center;
  padding: 0 .5rem;
}
.customer-sidebar:not(.expanded) .customer-sidebar-link > i,
.customer-sidebar:not(.expanded) .customer-sidebar-action > i {
  width: 24px;
  height: 24px;
}
.customer-sidebar:not(.expanded) .customer-sidebar-link[aria-current="page"]::before {
  left: calc(50% - 12px);
  width: 4px;
  border-radius: 0 2px 2px 0.
}
.customer-sidebar:not(.expanded) .customer-sidebar-link,
.customer-sidebar:not(.expanded) .customer-sidebar-action {
  border-radius: .5rem.
}
.customer-sidebar:not(.expanded) .customer-sidebar-link[aria-current="page"] {
  border-radius: .5rem.
}

/* Scrim */
.customer-sidebar-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 1039;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--dur-fast), visibility var(--dur-fast).
}
.customer-sidebar-scrim.show {
  opacity: 1;
  visibility: visible.
}

/* Mobile sidebar layout: hide desktop navbar, keep utility bar & mobile action bar, show sidebar */
@media (max-width: 1199.98px) {
  .site-header .navbar-main {
    display: none;
  }
  .customer-sidebar {
    display: flex;
    top: 0;
    height: 100dvh;
  }
  body.has-mobile-bar:not([data-admin-page]) {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
  main,
  .site-footer,
  .utility-bar,
  .mobile-action-bar {
    padding-left: calc(var(--customer-rail-width, 60px) + 12px) !important;
    padding-right: 12px !important;
    box-sizing: border-box;
  }
  .customer-sidebar.expanded ~ main,
  .customer-sidebar.expanded ~ .site-footer,
  .customer-sidebar.expanded ~ #customerSidebarScrim + main {
    /* content doesn't move, sidebar overlays */
  }
}'''

# Find the section to replace
start_idx = content.find(old_start)
if start_idx == -1:
    print('START NOT FOUND')
else:
    print(f'Found start at {start_idx}')

# Find the end - next major section
end_marker = '/* GCash pending blink animation */'
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print('END NOT FOUND')
else:
    print(f'Found end at {end_idx}')
    new_content = content[:start_idx] + new_css + '\n\n' + content[end_idx:]
    with open('css/style.css', 'w') as f:
        f.write(new_content)
    print('Replacement done!')