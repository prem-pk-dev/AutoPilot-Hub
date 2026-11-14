# AutoPilot Hub — Architecture Blueprint

Version: 1.0  
Status: Research baseline  
Repository: prem-pk-dev/AutoPilot-Hub  
Budget target: INR 0, using free-tier services only  
Runtime constraint: no local installation required

## Product goal
AutoPilot Hub is a single-user, browser-first automation control center. It combines local browser capabilities with cloud workflows executed by GitHub Actions. The initial release targets all 15 product modules, delivered incrementally.

## Architecture principles
1. Browser-first development and operation; no local Python, Node.js, or desktop software installation.
2. Static multi-page frontend: separate HTML documents, shared CSS and JavaScript ES modules.
3. Local tasks execute only with explicit user interaction and browser-granted permissions.
4. Cloud tasks run in GitHub Actions with least-privilege permissions and bounded schedules.
5. Never put credentials, access tokens, or private user data in public source code, frontend bundles, committed JSON, or public artifacts.
6. Every feature must have a real capability, a clear unsupported state, and useful error handling. No fake controls or fabricated metrics.
7. Free-tier quotas and provider policy limits are enforced and documented; no promise of unlimited 24/7 execution.

## Runtime planes
### Browser plane
- Static pages served over HTTPS.
- JavaScript ES modules for UI and orchestration.
- IndexedDB for local workflow definitions, preferences, and browser-side history.
- File System Access API / file input APIs only where supported and only after user permission.
- Web Workers may be used for CPU-heavy image processing when supported.
- Browser APIs cannot silently control the entire desktop or arbitrary local folders.

### Cloud plane
- GitHub Actions workflows for scheduled and manually dispatched tasks.
- JavaScript scripts executed by a supported hosted runner; workflow YAML defines triggers and permissions.
- GitHub Actions logs and artifacts provide cloud run evidence and downloadable reports.
- Public Pages frontend must not contain secrets. Any authenticated API operation must be carefully scoped and use a server-side secret boundary; a public static site cannot safely hide a token.

### Hosting plane
- Cloudflare Pages serves the static frontend from the public GitHub repository.
- Initial release does not require a dedicated backend or paid database.
- Cloudflare Pages deployment and GitHub Actions automation are separate pipelines.

## Languages
- HTML5: page structure.
- CSS3: responsive design system and components.
- JavaScript ES modules: frontend, browser-side automation, validation, and cloud task scripts.
- YAML: GitHub Actions workflow definitions.
- JSON: workflow schemas, templates, settings, and reports.
- Markdown: documentation.

No Python or Node.js installation is required on the user's computer. GitHub-hosted runners may provide a managed JavaScript runtime for cloud jobs.

## Data model
- Browser-local: IndexedDB stores workflows, settings, run metadata, and local reports.
- Cloud: GitHub Actions run records, logs, and artifacts.
- Export/import: versioned JSON for workflow portability.
- Synchronization is not automatic across browsers/devices in v1.0.
- Browser storage may be cleared by the user/browser; provide export and backup guidance.

## Workflow execution model
A workflow consists of:
- trigger: manual, browser event, or supported GitHub schedule/dispatch;
- steps: typed actions with validated configuration;
- conditions: explicit branch/condition nodes;
- execution context: browser-local or cloud;
- result: status, timestamps, sanitized logs, and output references.

Do not assume browser-local schedules run while the browser is closed. Cloud schedules may be delayed and are subject to GitHub quotas and platform limits.

## Security boundary
- Public repository contents are public.
- Never commit tokens, passwords, private URLs, personal data, or real user reports.
- GitHub Actions secrets are used only for cloud tasks that genuinely need credentials.
- Workflow permissions default to read-only and are elevated per workflow only when necessary.
- Third-party websites and workflow inputs are untrusted.
- Avoid arbitrary user-supplied code execution in the visual builder.
- Confirm destructive operations and validate all inputs.

## Non-goals for v1
- Multi-user authentication and account management.
- Arbitrary remote desktop control.
- Always-on local agent or background desktop daemon.
- Unlimited cloud execution.
- Paid APIs, paid hosting, or mandatory external services.
- Guaranteed cross-device synchronization.

## Release acceptance
The release is complete only when each advertised module is implemented or explicitly marked as a documented integration/permission-dependent capability; workflows execute in their stated runtime; error states are tested; and deployment is verified on the actual hosted URL.
