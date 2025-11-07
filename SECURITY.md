# Security Checklist

## ✅ Already Implemented

- [x] Environment variables separated from code
- [x] `.env` file in `.gitignore`
- [x] `python-dotenv` installed and configured
- [x] Settings.py loads from environment variables
- [x] `.env.example` provided as template

## 🔒 Before Deploying to Production

### Critical Security Settings

- [ ] **Generate New SECRET_KEY**
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
  Update `SECRET_KEY` in `.env`

- [ ] **Disable DEBUG Mode**
  ```
  DEBUG=False
  ```

- [ ] **Configure ALLOWED_HOSTS**
  ```
  ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
  ```

- [ ] **Use Production Database**
  - Switch from SQLite to PostgreSQL/MySQL
  - Use strong database passwords
  - Keep credentials secure

- [ ] **Enable HTTPS/SSL**
  ```
  SECURE_SSL_REDIRECT=True
  SESSION_COOKIE_SECURE=True
  CSRF_COOKIE_SECURE=True
  SECURE_HSTS_SECONDS=31536000
  ```

### Additional Security Measures

- [ ] **Static Files**
  - Run `python manage.py collectstatic`
  - Use WhiteNoise or CDN for static file serving
  - Configure proper STATIC_ROOT

- [ ] **Database Backups**
  - Set up automated backups
  - Test restore procedures

- [ ] **Email Configuration**
  - Use production SMTP service (SendGrid, AWS SES, etc.)
  - Remove console email backend
  - Configure proper FROM address

- [ ] **CORS & CSRF**
  - Review CORS settings if using frontend separately
  - Ensure CSRF tokens are properly implemented
  - Configure trusted origins

- [ ] **Rate Limiting**
  - Add django-ratelimit or similar
  - Protect login/signup endpoints
  - Limit API requests

- [ ] **Logging**
  - Configure proper logging
  - Monitor error logs
  - Set up alerting

- [ ] **Dependencies**
  - Run `pip list --outdated`
  - Update packages with security vulnerabilities
  - Pin versions in requirements.txt

- [ ] **User Authentication**
  - Enforce strong password policies
  - Consider 2FA for organizers
  - Implement account lockout after failed attempts

### Files to Never Commit

✅ Already in `.gitignore`:
- `.env`
- `db.sqlite3`
- `__pycache__/`
- `*.pyc`
- `/media` (user uploads)

### Environment-Specific Settings

**Development** (current):
```
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_ENGINE=django.db.backends.sqlite3
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Production**:
```
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_ENGINE=django.db.backends.postgresql
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Deployment Checklist

1. [ ] Run security checks: `python manage.py check --deploy`
2. [ ] Review settings.py for hardcoded secrets
3. [ ] Test with DEBUG=False locally first
4. [ ] Backup database before migrating
5. [ ] Run migrations: `python manage.py migrate`
6. [ ] Collect static files: `python manage.py collectstatic`
7. [ ] Test all critical features
8. [ ] Monitor logs after deployment

### Regular Maintenance

- Weekly: Review error logs
- Monthly: Check for package updates
- Quarterly: Security audit
- Yearly: Rotate SECRET_KEY and API keys

---

**Remember**: Security is an ongoing process, not a one-time setup!
