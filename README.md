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

## Status
Foundation implementation in progress. The first responsive dashboard shell, IndexedDB workspace initialization, theme toggle, mobile navigation, and JSON backup export are implemented on `development/core-platform`. Remaining modules are phased work.
