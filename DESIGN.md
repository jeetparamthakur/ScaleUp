# Design System

<!-- impeccable:design-schema 1 -->

## Register

product

## Color Strategy

Restrained — cool slate neutrals with a vivid emerald primary and fuchsia accent (overridable via env). Light mode uses airy slate backgrounds; dark mode uses deep slate surfaces with brighter mint accents.

## Env-driven theme

**One knob:** set `NEXT_PUBLIC_BRAND_PRIMARY` (hex, e.g. `#E11D48`) in `.env` — light/dark primary shades, header chrome, mesh tint, and MUI `primary` all derive from it ([`deriveBrandPalette.ts`](src/theme/deriveBrandPalette.ts), [`brandEnv.ts`](src/theme/brandEnv.ts)).

Optional advanced overrides per mode/token: `NEXT_PUBLIC_THEME_LIGHT_*`, `NEXT_PUBLIC_THEME_DARK_*`. Applied at runtime via CSS variables ([`applyCssVariables.ts`](src/theme/applyCssVariables.ts), inline script in root layout).

Typography:

- `NEXT_PUBLIC_FONT_GOOGLE` — Google font id supported in [`src/theme/appFont.ts`](src/theme/appFont.ts) (e.g. `Inter`, `Plus Jakarta Sans`)
- `NEXT_PUBLIC_FONT_FAMILY` — CSS fallback stack (`--font-family-fallback`)

## Palette (Light)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#F8FAFC` | Page ground |
| `--foreground` | `#0F172A` | Body text |
| `--surface` | `#FFFFFF` | Panels, cards |
| `--theme-primary` | `#059669` | Primary actions, brand |
| `--color-secondary` | `#475569` | Muted text |
| `--color-accent` | `#D946EF` | Highlights |

## Palette (Dark)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0F172A` | Page ground |
| `--foreground` | `#F8FAFC` | Body text |
| `--surface` | `#1E293B` | Panels |
| `--theme-primary` | `#34D399` | Primary actions |
| `--color-secondary` | `#94A3B8` | Muted text |
| `--color-accent` | `#E879F9` | Highlights |

## Form controls

- **Height:** single-line controls use `--control-height` (**45px** max).
- **Primitives:** [`src/components/ui/inputs/`](src/components/ui/inputs/) — Tailwind + Radix Popover/Label.
- **RHF:** [`src/components/ui/inputs/rhf/`](src/components/ui/inputs/rhf/).
- **Legacy wrappers:** `FormTextField` / `FormPasswordField` delegate to `Input` during migration.
- **Showcase:** `/platform/design-system` (platform console).

Shared shell classes: `.control-base`, `.control-field-input` in [`globals.css`](src/app/globals.css).

## Typography

- **Font:** `var(--font-sans)` — `NEXT_PUBLIC_FONT_GOOGLE` via `appFont.ts` + `NEXT_PUBLIC_FONT_FAMILY` fallback stack
- **Source of truth:** [`src/theme/typography.ts`](src/theme/typography.ts) → CSS vars `--type-*`, utility classes `.type-*`, MUI `typography`, and [`AppText`](src/components/ui/AppText.tsx)
- **Roles:** `display`, `h1`–`h4`, `subheading`, `subtitle`, `body`, `body-sm`, `caption`, `overline`, `label`
- **Display headings:** balance via `.type-display` / `.type-h1`–`.type-h3`; letter-spacing on scale in `typography.ts`
- **Prose:** `.type-prose` caps width at `--type-prose-max-width` (70ch)
- **Layout tokens:** [`src/theme/layoutTokens.ts`](src/theme/layoutTokens.ts) (`--radius-panel`, `--shadow-panel`, etc.)

## Layout

- Max content width: `max-w-5xl` (PageContainer)
- Spacing rhythm: 4/6/8 Tailwind scale
- Panels: 16px border-radius, 1px border, subtle shadow — no nested cards

## App chrome (workspace)

**Void dock + command bar** — dark floating dock (`.sidebar-dock-void`) with neon edge glow and aurora brand; main header is an intense cockpit card (`.dashboard-command-bar-intense`) with grid haze, spinning module ring, and accent stripe. Rail: 72px collapsed, 260px hover-expand.

| Token / class | Role |
|---------------|------|
| `--chrome-sidebar-rail-bg` | Nav icon wells |
| `--chrome-nav-active-glow` | Active rail halo |
| `--chrome-dock-shadow` | Dock + command elevation |
| `.chrome-header-action` | Header icon buttons |

## Components (hybrid policy)

- **New forms:** use `ui/inputs` only — no new MUI `TextField` / `@mui/x-date-pickers` in touched files.
- **MUI (interim):** buttons, dialogs, tables, chips, typography until replaced in later phases.
- **Tailwind:** layout, spacing, control styling.
- **Shared primitives:** `src/components/ui/` (PageContainer, SubmitButton, inputs).

## Motion

- Subtle hover lift on primary buttons (`-translate-y-0.5`)
- `prefers-reduced-motion: reduce` disables animations
- No bounce or elastic easing

## Anti-patterns

- No purple-to-blue gradient heroes
- No Inter-as-display with generic centered hero
- No nested card-in-card layouts
- No gray muted body text below 4.5:1 contrast
- No nested interactive elements inside control triggers (icon adornments are decorative spans)
