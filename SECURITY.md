# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` (1.x) | Yes |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

1. Use [GitHub Security Advisories](https://github.com/GizzZmo/robtex-lightning-explorer/security/advisories/new) (preferred), or
2. Contact the repository owner via a private channel.

Include:

- Description of the issue
- Steps to reproduce
- Affected versions / commit SHA
- Any suggested fix

You should receive an acknowledgment within a reasonable time. We will coordinate a fix and disclosure.

## Automated security (GitHub Advanced Security)

This repository uses GitHub’s security tooling (free for public repos):

| Capability | How |
|------------|-----|
| **Code scanning (CodeQL)** | [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml) |
| **Dependency review** | [`.github/workflows/dependency-review.yml`](.github/workflows/dependency-review.yml) on PRs |
| **Dependabot** | [`.github/dependabot.yml`](.github/dependabot.yml) |
| **Container scanning (Trivy)** | CI/CD Docker jobs + SARIF upload |
| **Secret scanning** | Enable in repo **Settings → Advanced Security** (recommended: push protection) |

Results appear under **Security** in the repository UI.

## Secrets & keys

- Never commit `ROBTEX_API_KEY`, `ROBTEX_RAPIDAPI_KEY`, or other credentials.
- Prefer environment variables / host secrets (Render, Fly, GH Actions secrets).
- Rotate keys if exposure is suspected.
