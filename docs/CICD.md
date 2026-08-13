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
```

## Trivy container scanning

Uses **`aquasecurity/trivy-action@v0.36.0`** (official release tag; note the `v` prefix).

| Setting | Value |
|---------|--------|
| Severity gate | **CRITICAL, HIGH** (`exit-code: 1`) |
| Unfixed vulns | Ignored (`ignore-unfixed: true`) |
| Types | `os`, `library` |
| Scanners | `vuln`, `secret`, `misconfig` |
| SARIF | GitHub Security + workflow artifacts |

Suppress reviewed CVEs in `.trivyignore`.

Releases: https://github.com/aquasecurity/trivy-action/releases
