# Images Guide (EC Marketing)

## Current state
This project currently uses:
- `logo.jpg` / `logo.svg` for branding
- Product photos/placeholders in `images/*.jpg`

## Drop-in photo specs (no layout changes required)
Use consistent product photography so cards, galleries, and modals stay aligned.

- **Aspect ratio:** 4:3 (required for product cards/quick view)
- **Recommended size:** 1600 × 1200 px (minimum 1200 × 900 px)
- **Format:** JPG (photos) or PNG (transparent cutouts on white), optimized < 300 KB when possible
- **Background:** clean white or light neutral, centered product, ~8% padding
- **Naming:** keep existing filenames where possible (e.g. `bosch-gsb550.jpg`, `tank-firstank.jpg`) to avoid HTML/JS changes
- **Fit behavior:** CSS uses `object-fit: cover` in fixed-ratio containers, so real photos can replace placeholders without layout changes

## Category/illustration assets
If replacing SVG/CSS product illustrations with photos later:
- Keep a clear silhouette and visible label/scale where relevant (tank capacity, tool type)
- Maintain consistent lighting and angle across a category set

## Owner replacement checklist
- [ ] Replace placeholder product photos with real store/product photos (4:3)
- [ ] Confirm final logo asset and exact brand colors (hex) if different from current
- [ ] Provide approved final copy/taglines in English (and optional short Tagalog/Bisaya greeting only if desired)
- [ ] Confirm any official brand marks/usage guidelines for Bosch, Bestank, Firstank, etc.
