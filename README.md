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
Phase 3 and Phase 4 are merged into `development/core-platform`. Phase 4 provides manual browser-local workflows with an allow-listed action engine (text transforms, JSON validation, timestamps and bounded waits), plus a searchable Execution Center. Its Chromium regression suite passed 9/9 tests. Phase 5 is being developed on `development/phase-5-cloud-runtime`: a read-only GitHub repository health runner, versioned cloud workflow registry, downloadable JSON report artifact, and Scheduler workspace. Cloud dispatch remains a preview until the workflow file is approved for the repository's default branch; no recurring schedule or credentials are enabled. The cloud runner has 5 Node.js unit tests and is included in project CI; the latest Phase 5 CI run passed all 5 cloud tests and all 9 Chromium browser tests. `main` remains unchanged and no deployment has been performed.
