# GitHub Advanced Security (GHAS)

## Should we use it?

**Yes — for this public repo it is strongly recommended.**

On **public** GitHub.com repositories, the main GHAS capabilities used here are available **at no extra cost**. They complement existing Trivy container scans and Dependabot.

For **private** repos, Code Security / Secret Protection is a paid product (organization billing).

## What we enabled in-repo

| Feature | Status | Workflow / config |
|---------|--------|-------------------|
| **CodeQL code scanning** | Configured | `.github/workflows/codeql.yml` |
| **Dependency review** | Configured | `.github/workflows/dependency-review.yml` (PRs) |
| **Dependabot version updates** | Configured | `.github/dependabot.yml` |
| **Trivy container + SARIF** | Configured | CI/CD Docker jobs |
| **Secret scanning + push protection** | **Manual in Settings** | See below |
| **Dependabot security alerts / updates** | **Manual in Settings** | See below |

## What you must enable in GitHub UI

Repo → **Settings → Advanced Security** (or **Code security and analysis**):

1. **Dependency graph** — usually on by default for public repos  
2. **Dependabot alerts** — On  
3. **Dependabot security updates** — On  
4. **Secret scanning** — On  
5. **Push protection** (secret scanning) — On  
6. **Code scanning** — CodeQL workflow will upload; if “Default setup” is also enabled, prefer **one** approach (this advanced workflow *or* default, not both fighting each other)

Optional:

- **Private vulnerability reporting** — On (matches `SECURITY.md`)

## CodeQL details

- Language: `javascript-typescript`
- Build mode: `none` (no compiled build step required)
- Query suites: `security-extended`, `security-and-quality`
- Schedule: weekly + every push/PR to `main`

Findings: **Security → Code scanning alerts**

## Dependency review

On each PR, GitHub compares the dependency diff against the GitHub Advisory Database.

- Fails the check on **high** (and above) severity introductions  
- Posts a PR comment summary  
- Denies introducing `GPL-3.0` / `AGPL-3.0` licenses (adjust in the workflow if needed)

## How this fits with Trivy

| Layer | Tool |
|-------|------|
| Source code (XSS, injection, etc.) | **CodeQL** |
| Manifest dependency vulns on PRs | **Dependency review** + Dependabot |
| Container OS + app libs in image | **Trivy** |
| Accidental secrets in git | **Secret scanning** |

Together these cover app code, supply chain, and runtime image.

## Private repo note

If the repository is made private later, confirm organization **GitHub Code Security** / **Secret Protection** licensing before expecting CodeQL SARIF uploads and secret scanning to keep working.
