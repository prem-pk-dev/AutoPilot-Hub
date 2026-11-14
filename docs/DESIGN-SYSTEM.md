# AutoPilot Hub — Design System

## Brand
- Product: AutoPilot Hub
- Visual direction: Futuristic Black Cyan
- Primary accent: cyan
- Base surfaces: deep navy / near-black
- Typography: Manrope for headings; DM Sans / system sans-serif for UI
- Icons: lightweight text glyphs in the first UI baseline; replace with a consistent icon set only when assets are included and licensed appropriately.

## Layout
- Fixed desktop sidebar, collapsible mobile navigation.
- Sticky top bar with breadcrumb, runtime label, and theme control.
- Consistent page content width and spacing.
- Responsive card grids that collapse from three/four columns to two and one.
- Every major module has its own HTML document and shared CSS/JS.

## Components
- Sidebar navigation and brand mark.
- Top bar and breadcrumb.
- Primary and secondary actions.
- Notice banner.
- KPI cards.
- Panels and empty states.
- Module status label.
- Capability cards.
- Toast region for feedback.

## Accessibility
- Semantic landmarks and headings.
- Accessible names for icon-only buttons.
- Visible focus styles to be added during accessibility audit.
- Mobile navigation toggle uses a real button.
- Status is conveyed with text, not color alone.

## Themes
- Dark theme is the default.
- Light theme is optional and persisted in localStorage.
- Theme preference is local to the current browser profile.

## UI truthfulness
- A page shell is not a completed automation engine.
- Planned or pending features are labeled as such.
- Do not show invented task counts, uptime, success rates, connected states, or execution records.
- Disabled operations must explain why they are unavailable.
