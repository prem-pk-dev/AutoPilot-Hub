# AutoPilot Hub — Deployment Plan

## Frontend: Cloudflare Pages
1. Connect the public GitHub repository to Cloudflare Pages.
2. Select the production branch only after the first tested release is merged to main.
3. For a plain static HTML/CSS/JS site, use the repository root as the output directory if files are at root; no build command is required.
4. Verify the deployed index and each page on the real Pages URL.
5. Use preview deployments for branch review where supported by the account configuration.

## Cloud automation: GitHub Actions
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
