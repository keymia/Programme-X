# Security Audit Baseline

Date: 2026-04-28

## Implemented Controls

1. SQL Injection protection
- Prisma ORM parameterization in all DB queries.
- Strict DTO validation and `forbidNonWhitelisted` enabled.

2. XSS protection
- `helmet()` security headers enabled.
- Server-side input validation.
- React/Next auto-escaping for rendered content.

3. CSRF protection
- CSRF middleware removed from the stateless JSON API path; JWT auth, CORS allow-listing, Helmet, and rate limiting protect state-changing admin requests.

4. Rate limit
- Global express rate limiter in `main.ts`.
- Additional throttles already present on auth critical endpoints.

5. Logs
- Existing admin action logs in DB.
- SMTP and security operations log via Nest logger.

6. Backups auto
- Script: `ops/backup/backup-postgres.ps1`.
- Run via scheduler (Windows Task Scheduler or CI cron).

7. Encryption data
- AES-256-GCM utility for sensitive fields.
- IP address encrypted before persistence in applications module.

8. GDPR ready
- Data minimization, purpose limitation, retention policy template.
- DSR workflow documented.

9. Canadian privacy ready
- PIPEDA + Quebec Law 25 checklist and incident response documentation.

## Remaining Recommended Actions

1. Store SMTP, JWT and encryption secrets in managed secret vault.
2. Add SIEM integration for security events.
3. Add DB-at-rest encryption at infrastructure level.
4. Add WAF and bot management at edge.
