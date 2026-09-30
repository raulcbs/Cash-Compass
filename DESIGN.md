---
name: Cash Compass
description: A salary drawn as water irrigating four terraces in turn, on lime-washed chalk and worn stone.
colors:
  canvas: "#edede7"
  surface: "#f9f9f5"
  surface-sunken: "#e4e3db"
  surface-raised: "#ffffff"
  ink: "#1d1c19"
  ink-soft: "#45423c"
  muted: "#656157"
  line: "#d8d6cc"
  primary: "#17648a"
  primary-hover: "#11506f"
  primary-soft: "#d6e7ef"
  on-primary: "#ffffff"
  stone: "#6d655a"
  stone-soft: "#e7e3db"
  stone-ink: "#4e473e"
  orange: "#e2701f"
  orange-soft: "#fbe3d0"
  orange-ink: "#954207"
  rice: "#cfa232"
  rice-soft: "#f4eacb"
  rice-ink: "#69500f"
  crop: "#3d8541"
  crop-soft: "#dcebd7"
  crop-ink: "#2a6630"
  danger: "#b3362a"
  danger-soft: "#f7ddd9"
  on-danger: "#ffffff"
  hero-bg: "#0e4763"
  hero-ink: "#f2f5f3"
  hero-water: "#8fdcf5"
  hero-stone: "#d3c9b7"
  hero-orange: "#f4964a"
  hero-rice: "#ecc85c"
  hero-crop: "#8ccb6b"
  hero-danger: "#ff9d8e"
  dark-canvas: "#121210"
  dark-surface: "#1b1a17"
  dark-primary: "#72bfe0"
  dark-hero-bg: "#0a3347"
typography:
  display:
    fontFamily: "Funnel Display Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(3rem, 5.4vw, 4rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Funnel Display Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Funnel Display Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Funnel Sans Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Funnel Sans Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  hero: "44px 34px 48px 30px / 34px 48px 30px 44px"
  slab: "44px 20px 36px 14px / 18px 36px 20px 40px"
  tile: "24px 10px 20px 8px / 10px 20px 10px 22px"
  input: "14px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "32px"
  "8": "48px"
  "9": "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
    rounded: "{rounded.pill}"
    height: "44px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slab}"
    padding: "28px"
  panel-hero:
    backgroundColor: "{colors.hero-bg}"
    textColor: "{colors.hero-ink}"
    rounded: "{rounded.hero}"
    padding: "28px"
  panel-feature:
    backgroundColor: "{colors.primary-soft}"
    rounded: "{rounded.slab}"
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    height: "46px"
    padding: "0 16px"
  pill-orange:
    backgroundColor: "{colors.orange-soft}"
    textColor: "{colors.orange-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 11px"
  tab-bar:
    backgroundColor: "{colors.surface-raised}"
    rounded: "26px 22px 26px 22px / 22px 26px 22px 26px"
    padding: "6px"
---

# Design System: Cash Compass

## Overview

**Creative North Star: "Acequia y bancales"**

The salary is water let into a Valencian hillside in its turn. It irrigates four terraces in a fixed order (expenses, you, emergency fund, investment), and the month is drawn as that cascade: each terrace's length is its exact share of net income, and water drops from lip to lip. The ground is lime-washed chalk and stone-black ink. Acequia blue carries water and every action. Surfaces are hand-cut slabs with uneven corners and no hairline borders.

The system is organic and modern, calm and dense with figures, not decorative. Numbers are large Funnel Display; everything else is quiet Funnel Sans. One deep blue hero field anchors Overview; everything else is a stone slab on chalk. It rejects the balance-card-plus-donut default and the earlier sage-forest calm.

**Key Characteristics:**
- Four crop colours own whole regions, always in the same order.
- Dry, unassigned ground is hatched, never hidden.
- Worn-stone radii: every slab has the same unevenly cut corners.
- Depth from warm downward shadows and tonal steps, not borders.
- Signature motion: terraces rise, the water path draws in priority order.
- Light, dark and system themes share one token set.

## Colors

Chalk ground, stone ink, one water blue, four crop hues, and a single honest red.

### Primary
- **Acequia Blue** (#17648a): every action, link, focus ring, income, the active nav channel and tab. Dark theme lifts it to #72bfe0.
- **Acequia Wash** (#d6e7ef): soft tint for the lead "feature" slab, selected icon buttons and focus halos.
- **Deep Acequia Field** (#0e4763; #0a3347 in dark): the hero surface only. Inside it, tokens are remapped so water reads #8fdcf5.

### Secondary (the four crops, in law order)
- **Wall Stone** (#6d655a, soft #e7e3db, ink #4e473e): gastos, the first terrace.
- **Valencian Orange** (#e2701f, soft #fbe3d0, ink #954207): para ti, the second terrace and the Día a día slab.
- **Golden Rice** (#cfa232, soft #f4eacb, ink #69500f): colchón / fondo de emergencia, the third.
- **Huerta Green** (#3d8541, soft #dcebd7, ink #2a6630): inversión, the fourth. Also the success colour.

### Tertiary
- **Drought Red** (#b3362a, soft #f7ddd9): a real deficit, a failed save, a destructive action. Nothing else.

### Neutral
- **Lime-Wash Canvas** (#edede7): page ground.
- **Chalk Slab** (#f9f9f5) and **Raised Chalk** (#ffffff): panels and the one raised figure or floating bar.
- **Sunken Stone** (#e4e3db): inputs, secondary buttons, balance strips.
- **Stone Black** (#1d1c19), **Soft Ink** (#45423c), **Muted Stone** (#656157): text tiers, checked for AA on their surfaces.
- **Mortar Line** (#d8d6cc): dividers and grooves.

Dark values are a full mirror (canvas #121210, slab #1b1a17, raised #25241f, ink #eeece5) with the crop hues lifted for contrast.

### Named Rules
**The Crop Order Rule.** Stone, orange, rice, crop green, always in that order, always the same meaning. A priority never changes colour between screens.
**The Water Means Act Rule.** Blue is for actions, income and links. It never stands in for a crop.
**The Drought Rule.** Red appears only for a real deficit, failed save or destructive action, never as decoration or a mere warning tone.
**The Tint-and-Ink Rule.** On a crop tint, text uses that crop's `-ink`, not the base hue.

## Typography

**Display Font:** Funnel Display Variable (Segoe UI, system-ui fallback)
**Body Font:** Funnel Sans Variable (Segoe UI, system-ui fallback)

**Character:** Funnel Display is tight and confident for figures and headings; Funnel Sans keeps running text plain. Figures always use tabular numerals.

### Hierarchy
- **Display** (650, clamp 3rem to 4rem, 1, -0.04em): the remaining-month figure and the hero source amount (clamp 34px to 64px).
- **Headline** (650, 1.625rem, 1.1, -0.025em): priority amounts, balance figures, stat values (clamp 26px to 34px).
- **Title** (650, 1.25rem, 1.25): panel titles. Sidebar brand is 700, -0.03em. Base h1 to h3 default to 600, -0.02em, balanced wrapping.
- **Body** (400, 0.9375rem, 1.5): default text; prose capped near 58ch.
- **Label** (500, 0.8125rem; 0.75rem for notes and pills at 550): captions, field labels, shares.

### Named Rules
**The Tabular Figures Rule.** Any number a user compares (amounts, shares, terrace labels) sets `font-variant-numeric: tabular-nums`.
**The Tight Display Rule.** Display-face figures carry negative tracking between -0.02em and -0.04em, larger figures tighter.

## Layout

A fixed sidebar (256px; 92px icon rail at 1024px and below) sits on the canvas; content is capped at 1440px with a 40px gutter (24px tablet, 16px phone). Spacing is a 4px-based scale (4, 8, 12, 16, 20, 24, 32, 48, 64); slab padding is 28px (20px phone). Overview leads with the hero: cascade left (~1.55fr), priority price board right, switching by container width at 720px, stacked below that. Under it the four headline figures share one stone strip that wraps to 2x2 below 1180px. On phones a floating stone tab bar replaces the sidebar, with bottom padding that clears the safe area. Reference sections stay out of the tab bar.

## Elevation & Depth

Hybrid: tonal steps plus soft warm shadows, always offset downward. Separation comes from the step from canvas to slab, never from card borders (inputs keep a 1px mortar line as a control affordance).

### Shadow Vocabulary
- **Rest** (`0 1px 2px rgb(40 34 24 / 0.07)`): panels.
- **Lifted** (`0 1px 2px rgb(40 34 24 / 0.06), 0 10px 28px -12px rgb(40 34 24 / 0.18)`): the stat strip, hero, today's raised figure.
- **Floating** (`0 2px 6px rgb(40 34 24 / 0.08), 0 30px 64px -18px rgb(40 34 24 / 0.32)`): the tab bar, modals.

### Named Rules
**The Warm Downhill Rule.** Shadows are warm-tinted and fall downward; no hard offsets, no coloured glows.

## Shapes

Hand-cut stone. Hero, slab and tile each have their own unevenly rounded corner set (hero 44/34/48/30px; slab 44/20/36/14px; tile 24/10/20/8px, elliptical), shrunk on phones. Controls are full pills (buttons, pills, icon buttons) or 14px inputs. Small terraces (bars, legend swatches, the Día a día gauge) are flat-topped with a single rounded downhill lip (about 2px 6px 2px 2px). Grooves between figures are inset 1px lines that never touch the slab edge.

### Named Rules
**The Uneven Slab Rule.** Use the three named radius tokens for surfaces; never a uniform corner on a slab.

## Components

### Buttons
- **Shape:** full pill, 44px tall (36px small), 600 weight.
- **Primary:** Acequia Blue fill, white text, 0 20px padding; hover to #11506f; active scales to 0.98.
- **Secondary:** Sunken Stone fill, ink text. **Danger:** Drought Red fill, only for destructive confirmation.
- **Icon / text:** 40px round icon buttons (48px on phone); text actions are blue, underline on hover. Active icon takes the water tint.

### Panels
- Slab: Chalk fill, slab radius, rest shadow only (no inset highlight: it draws hairlines on uneven corners in dark), 28px padding. Feature variant takes the Acequia Wash tint. The Día a día slab takes Orange Soft.
- **Title mark:** every titled slab leads with the hero legend's terrace swatch (16x11px, 1/5/1/1 lip radius, 3px darker riser) in its priority colour, set with the Panel `accent` prop: water for income and the allocation, stone for expenses, orange for everything Día a día, rice for the emergency fund, crop for portfolio and projection.
- **Hero:** Deep Acequia field, hero radius, inset top highlight plus lifted shadow; locally remaps ink, muted, water, crop and danger tokens so children need no knowledge of the surface.
- **No repeated metric template:** slabs vary their form by what they hold. The emergency fund is a reservoir, the portfolio is terrace rows over a ruled footing, the projection leads with its chart and puts the end figures underneath as the legend.

### Reservoir (emergency fund)
- A 92px-wide cistern in section: stone walls as inset side and bottom shadows, a hatched dry bottom, and a rice-gold level with a 3px water line on top, rising on a spring to the share of the target. Dashed marks at each month of essential expenses carry small numerals on a chalk chip. Amount, coverage in months and "Faltan X €" sit beside it.

### Entry tables
- Rows on hairlines, no sunken header band. Under each name a small terrace bar shows the row's weight in the total, in the collection's colour (water for income, stone for expenses, crop for assets). A ruled 2px footing closes the table with "Total mensual" or "Valor total" as a Headline figure.

### Inputs / Fields
- 46px, Sunken Stone fill, 1px mortar line, 14px radius, tabular figures. Hover darkens the line to muted; focus turns the line blue with a 3px Acequia Wash halo.

### Pills
- Small 12px pills, 550 weight, soft tint with matching `-ink` text; variants primary, neutral, stone, orange, rice, crop.

### Navigation
- **Sidebar:** a 3px mortar channel runs down the list; the active item is a raised slab with a blue "water" stretch sliding along the channel. A gap-dot separates reference sections. Tablet collapses to an icon rail with short labels.
- **Tab bar (phone):** floating raised stone bar, uneven radii, 48px items; the current item is a filled water-blue tile.

### Terrace bars
- Hatched dry-earth track (45-degree stripes, 12px tall, 8px small) with a lipped fill in the crop colour and an inset 3px darker underside.

### Terraces (signature)
- SVG hillside in the hero: one terrace per priority, length equals its share, hatched dry ground for unassigned income, cracks for deficit, a blue channel with a faint wet bank, and a water line dropping lip to lip. Share labels are Display 700, tabular, in the hero-bg colour on the fill.
- **Motion:** terraces rise on a spring (stiffness 70, damping 16) staggered 0.08s per priority; the water path draws (pathLength 0 to 1) over 1.5s after a 0.3s delay on load and each plan change. With reduced motion, durations and delays are zero and the path starts complete.

### Stat strip
- One raised-tone slab of figures separated by inset grooves; each label leads with a short 18x4px channel in its crop colour; values are Headline figures.

## Do's and Don'ts

### Do:
- **Do** colour priorities in the fixed order stone, orange, rice, crop green everywhere they appear.
- **Do** use Acequia Blue for actions, income and links, and let the primary button be the single blue pill per view.
- **Do** build surfaces from `--radius-hero`, `--radius-slab`, `--radius-tile`; use pills for controls.
- **Do** show unassigned or unspent ground as hatched, and show deficits in Drought Red.
- **Do** set money in Funnel Display 650 with negative tracking and tabular numerals.
- **Do** place components in the hero with the remapped tokens rather than hard-coded hero colours.
- **Do** honour `prefers-reduced-motion` for every terrace and path animation.

### Don't:
- **Don't** use red for anything but a real deficit, failed save or destructive action.
- **Don't** use blue as a crop colour or a crop colour as an action colour.
- **Don't** wrap slabs in hairline borders or use hard offset or coloured shadows.
- **Don't** fall back to the balance-card-plus-donut pattern or the sage-forest palette of the discarded world.
- **Don't** read crop hues as text on their own tint; use the `-ink` variant.
- **Don't** reintroduce the compass dial; the compass brand mark (brand-mark component, favicon) is the only compass.
