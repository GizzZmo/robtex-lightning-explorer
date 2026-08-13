# CI/CD Pipelines

## Overview

```
PR / push ──► CI
               ├─ Quality (Node 20)
               ├─ Compat Node 22 (main)
               └─ Docker build → health → Trivy (fail CRITICAL/HIGH)

push main / tag v* ──► CD
               ├─ Pre-publish quality
               ├─ Build image → Trivy gate → push GHCR
               └─ Optional Fly deploy

tag v* ──► Release
```

| Workflow | File | Triggers | Purpose |
|----------|------|----------|---------|
| **CI** | `.github/workflows/ci.yml` | PR + push `main` | Typecheck, build, smokes, Docker + **Trivy** |
| **CD** | `.github/workflows/cd.yml` | `main`, `v*`, manual | Trivy gate then publish GHCR |
| **Release** | `.github/workflows/release.yml` | `v*`, manual | GitHub Release |
| **Dependabot** | `.github/dependabot.yml` | Weekly | npm + Actions |

## Trivy container scanning

Uses [`aquasecurity/trivy-action@0.30.0`](https://github.com/aquasecurity/trivy-action).

| Setting | Value |
|---------|--------|
| Severity gate | **CRITICAL, HIGH** (`exit-code: 1`) |
| Unfixed vulns | Ignored (`ignore-unfixed: true`) |
| Types | `os`, `library` |
| Scanners | `vuln`, `secret`, `misconfig` |
| SARIF | Uploaded to **GitHub Security** + Actions artifacts |

### CI

1. Build `robtex-ln:ci`
2. Health smoke on `/health`
3. Trivy table (fails job on CRITICAL/HIGH)
4. Trivy SARIF → Security tab + `trivy-sarif` artifact

### CD

1. Build `robtex-ln:cd-scan` **before** push
2. Trivy gate (same severity rules)
3. SARIF → Security + `trivy-cd-sarif` artifact
4. Only then push tags to GHCR

### Suppressions

Add reviewed CVE IDs to [`.trivyignore`](../.trivyignore) (one per line).

### Viewing results

- **Actions** job logs (table output)
- **Security → Code scanning** (SARIF, default branch / non-fork PRs)
- Workflow **Artifacts** (`trivy-sarif`, `trivy-cd-sarif`)

## Image

```text
ghcr.io/gizzzmo/robtex-lightning-explorer:latest
ghcr.io/gizzzmo/robtex-lightning-explorer:main
ghcr.io/gizzzmo/robtex-lightning-explorer:<sha>
ghcr.io/gizzzmo/robtex-lightning-explorer:1.1.0
```

## Secrets

| Secret | Required | Used by |
|--------|----------|---------|
| `GITHUB_TOKEN` | automatic | GHCR, SARIF upload, releases |
| `FLY_API_TOKEN` | optional | Fly deploy |

## Release flow

```bash
git tag v1.2.0
git push origin v1.2.0
```
