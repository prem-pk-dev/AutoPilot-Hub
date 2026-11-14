# AutoPilot Hub

A browser-first, single-user automation control center built with HTML, CSS, JavaScript, JSON, and GitHub Actions YAML.

## Goals
- ₹0 budget target using free-tier services.
- No local software or programming-language installation.
- Browser-local utilities plus cloud automation through GitHub Actions.
- Static multi-page frontend hosted on Cloudflare Pages.
- All 15 planned modules delivered incrementally.

## Technology
- HTML5, CSS3, JavaScript ES modules
- JSON workflow definitions and data
- YAML GitHub Actions workflows
- IndexedDB for browser-local persistence
- GitHub Actions for scheduled/manual cloud jobs
- Cloudflare Pages for static hosting

## Important limitations
- Browser-local automation requires an open browser and user permissions where applicable.
- A static public frontend cannot safely store private API tokens.
- GitHub Actions schedules may be delayed and are subject to quotas and provider limits.
- Cloud workflows do not control the user's desktop.
- Browser data is not automatically synchronized between devices.

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Module scope](docs/MODULES.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Design system](docs/DESIGN-SYSTEM.md)

## Status
Phase 3 dashboard and local workflow management are merged into `development/core-platform`. Phase 4 is being developed on `development/phase-4-local-execution`: the first allow-listed browser-local engine supports text transformation, JSON validation, timestamp generation and bounded waits; successful and failed runs are stored in IndexedDB and shown in the Execution Center. This is a manual, open-tab runtime only. Schedule/webhook triggers, cloud execution and arbitrary code execution are not supported. The Phase 3.2 Chromium suite passed 7/7 tests. The Phase 4 Chromium suite now passes 9/9 browser tests, including successful and failed workflow execution plus execution-history export. Cross-browser testing outside Chromium remains future QA. No deployment or merge to `main` has been performed.
