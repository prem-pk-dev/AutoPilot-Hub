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
Phase 3 dashboard and local workflow management are implemented on `development/phase-3-dashboard`. The follow-up quality branch `development/phase-3-2-quality-tests` adds atomic JSON workflow imports, strict backup validation, IndexedDB error handling, and a Playwright + Chromium regression suite with GitHub Actions CI. The suite covers workflow CRUD/search/filter, import validation, backup/restore, guarded data clearing, mobile navigation and dashboard counts. The GitHub Actions Chromium run passed all 7 end-to-end tests, including the malformed-backup safety case; JavaScript syntax checks also passed. The suite currently covers the core browser workflows, while broader cross-browser visual QA remains future work. Workflow definitions do not execute; schedule/webhook triggers and automation engines remain pending. No deployment or merge to `main` has been performed.
