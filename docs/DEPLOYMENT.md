# AutoPilot Hub — Deployment Plan

## Frontend: Cloudflare Pages
1. Connect the public GitHub repository to Cloudflare Pages.
2. Select the production branch only after the first tested release is merged to main.
3. For a plain static HTML/CSS/JS site, use the repository root as the output directory if files are at root; no build command is required.
4. Verify the deployed index and each page on the real Pages URL.
5. Use preview deployments for branch review where supported by the account configuration.

## Cloud automation: GitHub Actions
- The Phase 5 cloud runner is defined in `.github/workflows/cloud-runner.yml` and reads the committed `automation/cloud-workflows.json` registry.
- The initial action checks public GitHub repository metadata and uploads a JSON report artifact; it does not use secrets or write permissions.
- GitHub requires a `workflow_dispatch` workflow file to exist on the repository default branch before it can be manually dispatched from the Actions UI. Until the workflow is approved and merged to that branch, treat the runner as a development preview.
- No cron schedule is enabled by default. Add one only after the manual cloud run is validated and the user chooses the required cadence; GitHub cron uses UTC and may be delayed.

- Store workflow files under .github/workflows/.
- Start with manual workflow_dispatch for safe validation.
- Add scheduled triggers only after manual runs pass.
- Set explicit permissions, concurrency, timeouts, and retention.
- Keep artifacts small and free of secrets.
- Monitor included minutes/storage quotas and current GitHub plan limits.

## Free-tier constraints
Free plans have quotas and feature limits that may change. Public repository Actions usage, private repository quotas, hosted runner limits, Cloudflare Pages limits, and artifact retention must be checked against current provider terms before enabling recurring workloads. No unlimited or guaranteed exact-time scheduling is promised.

## Deployment verification
- Confirm latest successful production deployment.
- Open the live URL in a fresh browser session.
- Check all navigation links and static assets.
- Verify responsive behavior.
- Confirm no credentials or private data are present in the deployed bundle.
