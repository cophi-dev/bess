---

title: "OpenAutobidder-DE"

version: "2.0"

---

# Design System – Warm Minimalist Style

This file is the single source of truth for all UI styling decisions.

## Design Philosophy

- **Style**: Minimalist, elegant, Apple-inspired
- **Feeling**: Warm, cosy, calm, and trustworthy
- **Tone**: Premium but approachable — think modern serif typography with soft, natural colors

## Web product and information architecture

- **Public product name:** **BESS Kompass** — the education-first entry to how grid-scale storage earns money in Germany (revenue stacking, not just arbitrage).
- **Engine / model name:** **OpenAutobidder-DE** — the open, inspectable simulator; use where technical credibility matters, not in every page title.
- **Audience:** teams, students, and decision-makers who need to **evaluate** German BESS cases clearly.
- **North star (first visit):** **learn first** — concepts and market context before the simulator. Typical path: start at `/` → `/revenue-stacking` and `/german-market` → `/simulator` to run the open model. `/tagesupdate` is the daily return habit.
- **Main routes to keep consistent:** Ueberblick (`/`), Lernpfad (`/revenue-stacking`), Markt (`/german-market`), Tagesupdate (`/tagesupdate`), Ressourcen (`/resources`), Info (`/about`), Simulator (`/simulator`).

## Design Tokens

```yaml

colors:

  # Backgrounds

  background: "#F9F6F0"          # Warm off-white (cosy base)

  background_alt: "#F1EDE5"      # Slightly warmer card background

  surface: "#FFFFFF"             # Pure white for cards/modals

  # Text

  text: "#2C2C2C"                # Soft dark gray (easy on the eyes)

  text_secondary: "#5C5C5C"      # Muted gray for secondary text

  # Brand Colors (warm & elegant)

  primary: "#2E4A3E"             # Deep forest green (calm & trustworthy)

  accent: "#C9A86C"              # Warm gold / terracotta accent

  highlight: "#8B9A7D"           # Soft sage green

  # Status

  success: "#4A7C59"             # Calm green

  warning: "#C9A86C"             # Warm gold

  error: "#B85C38"               # Muted terracotta

typography:

  font_family: "'Playfair Display', Georgia, serif"   # Elegant serif for headings

  body_font: "Inter, system-ui, -apple-system, sans-serif"  # Clean sans for readability

  font_size_base: "16px"

  font_size_lg: "20px"

  font_weight_regular: "400"

  font_weight_bold: "600"

layout:

  spacing_unit: "8px"

  border_radius: "10px"

  card_padding: "28px"

  max_width: "1280px"

  shadow: "0 4px 20px rgba(0, 0, 0, 0.06)"   # Soft, subtle shadow
```

