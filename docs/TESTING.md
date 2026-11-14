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

The repository includes a Playwright + Chromium end-to-end suite under `tests/e2e/`. GitHub Actions runs JavaScript syntax checks and the browser suite on pushes to `development/phase-3-2-quality-tests` and on pull requests targeting the configured development/main branches.

Covered user flows:
- Create, search, filter, edit and delete a workflow.
- Reject a malformed workflow import without saving any partial records.
- Export a workspace backup and restore workflow data plus theme preference.
- Require two confirmations before clearing local data.
- Open mobile navigation and check for horizontal overflow at 390px.
- Confirm dashboard counts reflect IndexedDB records.

Run locally after installing dependencies and Chromium:
```sh
npm install
npx playwright install chromium
npm run test:e2e
``

A test suite being configured is not the same as a passing run. Release status must be updated only after checking the corresponding GitHub Actions run.

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
