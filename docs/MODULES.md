# AutoPilot Hub — Module Scope

All 15 modules are in the product scope. Implementation is phased; a module is not considered complete merely because its page exists.

| # | Module | v1 scope | Runtime |
|---|---|---|---|
| 1 | Overview Dashboard | Real counts, recent runs, health and quick actions | Browser + cloud data |
| 2 | Workflow Builder | Create/edit validated workflow definitions and metadata | Browser (local IndexedDB) |
| 3 | Scheduler | Explain and configure supported GitHub schedules; manual dispatch | Cloud |
| 4 | Browser Automation | User-initiated navigation, page checks, permitted form interactions | Browser |
| 5 | GitHub Automation | Repository/branch/workflow monitoring using safe public data or scoped credentials | Browser + cloud |
| 6 | Website Monitoring | HTTP availability/status checks and reports from Actions | Cloud |
| 7 | File Automation | User-selected file validation, rename planning, CSV/JSON processing | Browser |
| 8 | Image Studio | Client-side PNG/JPEG/WebP conversion where browser codec support permits | Browser |
| 9 | Execution Center | Run list, status, timestamps, logs, retry guidance | Browser + cloud |
| 10 | Notifications | In-app notifications for known events; no unsupported push claims | Browser |
| 11 | Analytics & Reports | Success/failure trends from actual stored run records; CSV/JSON export | Browser |
| 12 | Integrations | Connection status and setup guides; no fake connected state | Browser + cloud |
| 13 | Template Library | Validated starter workflows with import/duplicate actions | Browser |
| 14 | Security Center | Secret-handling guidance, permission review, audit-friendly events | Browser + GitHub settings |
| 15 | Settings | Theme toggle, full workspace backup/restore, guarded local-data clearing | Browser (local IndexedDB) |

## Shared requirements
- Separate HTML page for each major module.
- Shared navigation, design tokens, accessible controls, responsive layouts.
- Loading, empty, success, permission-denied, unsupported-browser, and error states.
- Search/filter/sort only where the data volume and module need them.
- Keyboard-accessible navigation and visible focus.
- No duplicate filler cards or invented execution metrics.

## Definition of done
1. User can perform the advertised task, not merely click a decorative control.
2. Inputs are validated and errors are actionable.
3. Results and timestamps come from real execution or are clearly labeled sample/demo data.
4. Browser and cloud runtime are identified in the UI.
5. Permission requirements and provider limits are explained.
6. Desktop, tablet, and mobile layouts are checked.
7. Security and regression tests pass.
