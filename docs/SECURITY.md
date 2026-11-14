# AutoPilot Hub — Security Baseline

## Public repository warning
This repository is public. All committed files, workflow definitions, examples, and history are publicly readable. Never commit credentials, personal information, private reports, or production secrets.

## Secrets
- Do not store GitHub tokens or API keys in HTML, CSS, JavaScript, JSON, Markdown, or frontend environment variables.
- Use GitHub Actions Secrets only for cloud workflows that require authentication.
- Use the narrowest token permissions and repository scope available.
- Never echo secrets in logs, artifacts, error messages, or debug output.
- Rotate and revoke any credential accidentally exposed; removing it in a later commit does not erase Git history.

## Workflow permissions
- Set workflow-level permissions explicitly.
- Default to contents: read where possible.
- Add write permissions only to the individual job that requires them.
- Pin third-party actions to reviewed immutable commit SHAs where practical.
- Avoid executing untrusted pull-request code with secrets.
- Validate all workflow_dispatch inputs and remote response data.

## Browser security
- Request file/device permissions only at the moment a feature needs them.
- Explain what is accessed and why.
- Do not upload local files without explicit user action.
- Sanitize displayed remote text and avoid unsafe HTML insertion.
- Never claim the website can control arbitrary desktop applications.
- Treat imported workflow JSON as untrusted input; validate schema, node types, sizes, and URLs.

## Public static frontend limitations
A static public website cannot keep a secret API token private. Do not build authenticated private-account operations that expose a token to browser JavaScript. Prefer public read-only data, user-mediated links, or a properly secured server-side integration if one is later approved.

## Data retention
- Keep browser data local by default.
- Provide export and clear-data controls with confirmation.
- Cloud artifacts must not contain secrets or unnecessary personal data.
- Explain that browser storage can be cleared by browser settings.

## Security acceptance checklist
- No secrets in repository scan.
- Least-privilege workflow permissions.
- Input validation and output escaping.
- Explicit confirmation for destructive operations.
- No untrusted code execution in workflow builder.
- Clear permission and privacy copy.
