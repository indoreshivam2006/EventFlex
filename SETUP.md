# Environment Setup Guide

## Quick Start

Your `.env` file has been created at `EventFlex/.env` with default development settings.

### Current Configuration

✅ **SECRET_KEY**: Using your existing Django secret key (change for production!)
✅ **DEBUG**: Enabled (`True`) for development
✅ **ALLOWED_HOSTS**: localhost, 127.0.0.1
✅ **DATABASE**: SQLite (db.sqlite3)
✅ **EMAIL**: Console backend (emails printed to terminal)

### What You Need to Do

1. **Keep `.env` secure** - Never commit it to Git (already in .gitignore)

2. **For production deployment**, update these in `EventFlex/.env`:
   ```bash
   # Generate a new secret key
   SECRET_KEY=your-new-production-secret-key-here
   
   # Disable debug mode
   DEBUG=False
   
   # Add your domain
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   
   # Use PostgreSQL
   DATABASE_ENGINE=django.db.backends.postgresql
   DATABASE_NAME=eventflex_prod
   DATABASE_USER=your_db_user
   DATABASE_PASSWORD=your_db_password
   DATABASE_HOST=your_db_host
   DATABASE_PORT=5432
   
   # Configure real email
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-specific-password
   ```

3. **To generate a new SECRET_KEY**:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

### Email Setup (Gmail Example)

If you want to send real emails:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-16-char-app-password
   ```

### Testing the Setup

Run these commands to verify everything works:

```bash
# Check for configuration issues
python manage.py check

# Test database connection
python manage.py migrate

# Run the development server
python manage.py runserver
```

### Files Created

- ✅ `EventFlex/.env` - Your actual environment variables (not in git)
- ✅ `.env.example` - Template for other developers (in git)
- ✅ `.gitignore` - Prevents sensitive files from being committed
- ✅ `requirements.txt` - All Python dependencies
- ✅ `README.md` - Complete project documentation

### Next Steps

1. Run migrations: `python manage.py migrate`
2. Create superuser: `python manage.py createsuperuser`
3. Populate sample data: `python manage.py populate_data`
4. Start server: `python manage.py runserver`
5. Visit: http://localhost:8000/

---

**Need help?** Check the README.md for full documentation.
