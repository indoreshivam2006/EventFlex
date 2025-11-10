# EventFlex - Vercel Deployment Guide

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub account with EventFlex repository
- Vercel account (sign up at https://vercel.com)

### Deployment Steps

1. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository: `indoreshivam2006/EventFlex`

2. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically detect the configuration from `vercel.json`
   - Wait for the build to complete

### Important Files for Deployment

- `vercel.json` - Vercel configuration
- `build_files.sh` - Build script for static files
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version specification
- `.vercelignore` - Files to ignore during deployment

### Post-Deployment

After successful deployment:
1. Your app will be available at: `https://your-project-name.vercel.app`
2. Update ALLOWED_HOSTS in environment variables with your actual domain
3. Set up database (consider using Vercel Postgres or external database)

### Database Considerations

**Important:** SQLite won't work on Vercel (serverless environment).

Options:
1. **Vercel Postgres** (Recommended)
2. **Railway PostgreSQL**
3. **PlanetScale MySQL**
4. **MongoDB Atlas**

Add database configuration to environment variables:
```
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=your_db_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=your_db_host
DATABASE_PORT=5432
```

### Troubleshooting

**Build Failures:**
- Check Python version in `runtime.txt`
- Verify all dependencies in `requirements.txt`
- Check Vercel build logs

**Static Files Not Loading:**
- Ensure `STATIC_ROOT` is set correctly
- Run `collectstatic` in build script

**Database Errors:**
- SQLite won't work on Vercel
- Use PostgreSQL or MySQL instead

### Local Development

```bash
# Activate virtual environment
.\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver
```

## 📝 License

MIT License - See LICENSE file for details
