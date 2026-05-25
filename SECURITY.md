# Security

## Secret Policy

Never commit:

- API keys
- OAuth tokens
- signing keys
- certificates/private keys
- `.env` files
- local app data
- recordings or transcripts
- downloaded local models

This repo uses a pre-push hook:

```sh
.githooks/pre-push
```

It runs:

```sh
gitleaks detect --source . --redact --verbose
```

Do not bypass it.

## Reporting

This is currently a personal public fork. Report security issues privately to Damian before opening a public issue with exploit details.

## Dependency Risk

The project still contains temporary Epicenter workspace packages. Some auth/server/sync code exists because of dependency chains, not necessarily because Whispering Open should expose those capabilities.

Treat any auth, sync, updater, analytics, or release-signing change as security-sensitive.
