# CI/CD Pipelines

## Overview

```
PR / push ──► CI (quality + docker build smoke)
                 │
push main ──► CD (re-check quality → publish GHCR)
                 │
tag v*    ──► CD + Release notes
                 │
optional  ──► Fly.io deploy (FLY_API_TOKEN)
```

| Workflow | File | Triggers | Purpose |
|----------|------|----------|---------|
| **CI** | `.github/workflows/ci.yml` | PR + push to `main` | Typecheck, build, CLI/server smoke, Docker build (no push), Node 22 compat on main |
| **CD** | `.github/workflows/cd.yml` | Push `main`, tags `v*`, manual | Publish `ghcr.io/gizzzmo/robtex-lightning-explorer` |
| **Release** | `.github/workflows/release.yml` | Tags `v*`, manual | GitHub Release + notes |
| **Dependabot** | `.github/dependabot.yml` | Weekly | npm + Actions updates |

## CI jobs

1. **Quality (Node 20)** — install, typecheck, build, entrypoints, CLI + HTTP `/health` smoke  
2. **Compat Node 22** — main only  
3. **Docker build** — build image and run container health check (does not push)

## CD jobs

1. **Pre-publish quality** — block publish on type/build failure  
2. **Publish GHCR image** — tags: `latest` (main), branch, semver, short SHA  
3. **Deploy Fly.io** — only if `FLY_API_TOKEN` is set and (version tag **or** manual dispatch with *Deploy Fly*)

### Image

```text
ghcr.io/gizzzmo/robtex-lightning-explorer:latest
ghcr.io/gizzzmo/robtex-lightning-explorer:main
ghcr.io/gizzzmo/robtex-lightning-explorer:<sha>
ghcr.io/gizzzmo/robtex-lightning-explorer:1.1.0   # from tag v1.1.0
```

Package visibility defaults to private for GHCR — set to **Public** under GitHub → Packages if needed.

## Secrets

| Secret | Required | Used by |
|--------|----------|---------|
| `GITHUB_TOKEN` | automatic | GHCR push, releases |
| `FLY_API_TOKEN` | optional | Fly deploy job |

Add optional app secrets on the host (`ROBTEX_API_KEY`, `ROBTEX_RAPIDAPI_KEY`), not in GitHub unless you inject them at deploy time.

## Release flow

```bash
git tag v1.2.0
git push origin v1.2.0
# → CD publishes semver image tags
# → Release workflow opens a GitHub Release
```

Or: Actions → **Release** → Run workflow → enter `v1.2.0`.

## Local parity

```bash
npm install && npm run typecheck && npm run build
node dist/cli.js --version
node dist/server.js & curl -sf localhost:3847/health
docker build -t robtex-ln .
```
