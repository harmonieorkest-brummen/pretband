# Security Policy

## Supported Versions

Only the latest version of this project is actively maintained and receives security updates.

| Version | Supported |
| ------- | --------- |
| latest (`main`) | ✅ |
| older branches | ❌ |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, report it privately so we can address it before it becomes public knowledge.

**To report a vulnerability:**

- Open a [GitHub Security Advisory](https://github.com/HOBrummen/pretband/security/advisories/new) (preferred)
- Or email the maintainers directly (see the repository profile for contact details)

Please include as much of the following as possible:
- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Any suggested fixes or patches

---

## Response Timeline

We are a small volunteer-run project, but we take security seriously. You can expect:

- **Acknowledgement** of your report within **5 business days**
- **A fix or mitigation plan** within **30 days**, depending on severity

We'll keep you updated throughout the process and credit you in the release notes if you'd like.

---

## Scope

Given the nature of this project (a community band website), the most relevant security concerns are:

- **Dependencies with known CVEs** — please flag outdated or vulnerable packages
- **XSS or injection vulnerabilities** — if the site handles any user input
- **Exposed secrets or credentials** accidentally committed to the repo

Issues related to the content of the website (text, photos, etc.) are not security vulnerabilities — please open a regular issue for those.

---

## Responsible Disclosure

We ask that you follow responsible disclosure practices:
- Give us a reasonable time to fix the issue before going public
- Don't exploit the vulnerability beyond what is needed to demonstrate it
- Act in good faith — we'll do the same 🎺
