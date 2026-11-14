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
The Phase 3–5 release is merged into `main` (merge commit `ddb5b5990feb59af837370e4742ce08e3794f34d`). The release includes the static multi-page dashboard, browser-local workflow CRUD and IndexedDB persistence, validated import/export and backup/restore, allow-listed manual local execution, searchable execution history, a read-only GitHub repository health cloud runner, a versioned cloud workflow registry, JSON report artifacts, and the Scheduler workspace preview. The latest Phase 5 CI run passed all 5 cloud-runner unit tests and all 9 Chromium browser regression tests. The post-merge GitHub Pages build/deployment workflow completed successfully; verify the configured live hosting URL and each page before treating the website as production-validated. The cloud runner is now present on `main`, but a real manual `workflow_dispatch` run and artifact download have not yet been verified. No recurring schedule or credentials are enabled. Browser-local execution still requires an open browser; cloud jobs run on GitHub-hosted runners and are subject to quotas and scheduling delays. Six historical development branches remain in the repository pending manual cleanup.
