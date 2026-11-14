# AutoPilot Hub — Testing Strategy

## Test layers
1. Static checks: HTML validity, broken links, missing assets, duplicate IDs, console errors.
2. UI checks: navigation, keyboard access, focus visibility, empty/loading/error states.
3. Responsive checks: narrow mobile, tablet, desktop, zoom and long-content behavior.
4. Unit checks: validators, workflow schema, date/time conversion, CSV/JSON parsing.
5. Browser capability checks: IndexedDB availability, file API support, image codec support, permission denial.
6. Workflow checks: YAML syntax, workflow triggers, explicit permissions, input validation, bounded timeouts.
7. Integration checks: real GitHub Actions run, actual artifact/log retrieval, actual monitoring result.
8. Regression checks: previously working modules after each merge.
9. Security checks: secret scan, unsafe HTML patterns, public-data review, least privilege.

## Automated browser regression suite

The repository includes a Playwright + Chromium end-to-end suite under `tests/e2e/` and Node.js unit tests for the cloud runner under `tests/cloud-runner.test.mjs`. GitHub Actions runs JavaScript syntax checks and the browser suite on pushes to the Phase 3.2, Phase 4 and Phase 5 development branches, and on pull requests targeting the configured development/main branches.

Covered user flows:
- Create, search, filter, edit and delete a workflow.
- Reject malformed workflow imports without partial saves; export workflow JSON.
- Export a workspace backup and restore workflow data plus theme preference.
- Reject invalid workspace backups without replacing existing data.
- Require two confirmations before clearing local data.
- Open mobile navigation and check for horizontal overflow at 390px.
- Confirm dashboard counts reflect IndexedDB records.
- Execute a text-transform workflow and verify persisted step output.
- Execute invalid JSON input and verify a failed run is recorded.
- Export execution history.
Cloud runner unit tests can be run with `npm run test:cloud` (Node.js built-in test runner; no extra dependency).\n\nRun browser tests locally after installing dependencies and Chromium:
```sh
npm install
npx playwright install chromium
npm run test:e2e
``

The Phase 3.2 Chromium suite passed 7/7 tests. The Phase 4 Chromium suite passed 9/9 tests on GitHub Actions, including successful and failed manual runs. Phase 5 cloud-runner unit tests validate the registry allow-list, disabled/unknown workflow rejection, successful JSON report generation, API failures and malformed targets. The Phase 5 CI run must pass before merging. Cross-browser testing outside Chromium and deeper visual QA remain release follow-ups.

## Test data policy
- Synthetic fixtures must be labeled test data.
- Never present fabricated sample counts as live statistics.
- Do not use real credentials or private user data in test fixtures.
- Keep test URLs and expected outcomes documented.

## Release gates
- Every page loads without console errors.
- Every visible control has a real action or is clearly disabled with an explanation.
- Browser-local and cloud operations are labeled distinctly.
- Unsupported browser features degrade gracefully.
- Failed jobs show actionable diagnostics without revealing secrets.
- Mobile navigation and all critical flows work.
- Deployment URL is checked after publishing.
