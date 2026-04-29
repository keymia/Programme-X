# Enterprise Production Deployment

## 1) Build and release
1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. Build Docker images for `apps/web` and `apps/api`
4. Push to private registry

## 2) Environment
- Set strong secrets: `JWT_ACCESS_SECRET`, `APP_ENCRYPTION_KEY`, `SMTP_*`
- Set domains: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`
- Use managed PostgreSQL with TLS enabled

## 3) Runtime architecture
- Web and API deployed as separate services
- Horizontal scaling enabled (stateless app nodes)
- Reverse proxy / gateway with TLS termination and WAF

## 4) Performance
- CDN for static assets
- Response compression enabled (`next.config.mjs`)
- DB indexes for frequent filters and admin dashboards

## 5) Security and compliance
- Helmet, CSRF, rate limits active
- Encrypted sensitive fields in app layer
- Daily automated backup + retention policy
- GDPR / PIPEDA / Law 25 process documentation maintained

## 6) Observability
- Centralized logs, alerting, uptime checks
- Error tracking and audit-log reviews
- Monthly restore drill from backups

