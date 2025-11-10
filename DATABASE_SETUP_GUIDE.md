# 🗄️ EventFlex - Database Setup Guide for Vercel Deployment

## Why PostgreSQL Instead of SQLite?

**SQLite doesn't work on Vercel** because:
- Vercel uses serverless functions (ephemeral filesystem)
- Each request may run on different servers
- Database file would be lost after deployment

**PostgreSQL is Required** for production deployment on Vercel.

---

## 🚀 Option 1: Vercel Postgres (Recommended - Easiest)

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (EventFlex)
3. Click on **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose a database name (e.g., `eventflex-db`)
7. Select region (choose closest to your users)
8. Click **"Create"**

### Step 2: Get Database Credentials

After creation, Vercel will show you:
- `POSTGRES_URL` - Full connection string
- `POSTGRES_PRISMA_URL` - For Prisma (not needed)
- `POSTGRES_URL_NON_POOLING` - Direct connection

### Step 3: Set Environment Variables in Vercel

Vercel automatically adds these variables to your project:
```
POSTGRES_URL=postgres://username:password@host:5432/database
POSTGRES_HOST=your-host.postgres.vercel-storage.com
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database
```

Add this additional variable:
```
DATABASE_URL=${POSTGRES_URL}
```

### Step 4: Deploy

Just push your code - Vercel will automatically use the database!

```bash
git add .
git commit -m "Update database configuration"
git push origin main
```

---

## 🚂 Option 2: Railway PostgreSQL (Free Alternative)

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Provision PostgreSQL"**

### Step 2: Get Database Credentials

Railway will show:
- **Host**: `containers-us-west-xxx.railway.app`
- **Port**: `5432`
- **Database**: `railway`
- **Username**: `postgres`
- **Password**: (auto-generated)
- **DATABASE_URL**: Full connection string

### Step 3: Add to Vercel Environment Variables

In your Vercel project settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:password@host:5432/railway
```

OR individual variables:

```
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=railway
DATABASE_USER=postgres
DATABASE_PASSWORD=your-railway-password
DATABASE_HOST=containers-us-west-xxx.railway.app
DATABASE_PORT=5432
```

---

## 🌍 Option 3: Neon (Serverless Postgres - Free Tier)

### Step 1: Create Neon Account

1. Go to https://neon.tech/
2. Sign up with GitHub
3. Click **"Create a Project"**
4. Choose a project name
5. Select region

### Step 2: Get Connection String

Neon provides a connection string like:
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Add to Vercel

In Vercel Environment Variables:
```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🐘 Option 4: ElephantSQL (Free PostgreSQL)

### Step 1: Create Account

1. Go to https://www.elephantsql.com/
2. Sign up (free tier: 20MB storage)
3. Click **"Create New Instance"**
4. Name: `eventflex`
5. Plan: **Tiny Turtle (Free)**
6. Select region
7. Click **"Create"**

### Step 2: Get Credentials

Click on your instance to see:
- **Server**: `raja.db.elephantsql.com`
- **User & Default database**: `username`
- **Password**: `your-password`
- **URL**: Full connection string

### Step 3: Add to Vercel

```
DATABASE_URL=postgres://username:password@raja.db.elephantsql.com/username
```

---

## 📋 Vercel Environment Variables Setup

### Go to Your Vercel Project:

1. Open https://vercel.com/dashboard
2. Select your EventFlex project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

### Method A: Using DATABASE_URL (Recommended)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Django Settings
SECRET_KEY=your-secret-key-here-generate-new-one
DEBUG=False
ALLOWED_HOSTS=.vercel.app

# Optional: Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Method B: Individual Database Variables

```bash
# Database Configuration
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=your_database_name
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_HOST=your-host.com
DATABASE_PORT=5432

# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.vercel.app
```

---

## 🔑 Generate a Secure SECRET_KEY

### Option 1: Using Python

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Option 2: Using Online Generator

Visit: https://djecrety.ir/

Copy the generated key and paste in Vercel environment variables.

---

## 🧪 Testing Your Database Connection

### 1. Install PostgreSQL Locally (Optional for Testing)

```bash
# Install psycopg2 for PostgreSQL support
pip install psycopg2-binary dj-database-url
```

### 2. Create .env File for Local Testing

Create `EventFlex/.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 3. Test Connection Locally

```bash
# Activate virtual environment
.\env\Scripts\activate

# Test database connection
python manage.py check --database default

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

---

## 🚀 Deployment Checklist

- [ ] PostgreSQL database created (Vercel Postgres/Railway/Neon/ElephantSQL)
- [ ] Database credentials obtained
- [ ] Environment variables added in Vercel
- [ ] SECRET_KEY generated and added
- [ ] DEBUG set to False
- [ ] ALLOWED_HOSTS configured
- [ ] Code pushed to GitHub
- [ ] Vercel deployment triggered
- [ ] Migrations run successfully
- [ ] Admin user created

---

## 📝 Post-Deployment Commands

After successful deployment, you may need to run migrations manually:

### Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migrations
vercel env pull .env.production
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Alternative: Add to build_files.sh (Already Included)

The `build_files.sh` already includes:
```bash
python3.9 manage.py makemigrations --noinput
python3.9 manage.py migrate --noinput
```

---

## 🔧 Troubleshooting

### Error: "could not connect to server"

**Solution**: Check your database credentials and ensure the database is running.

### Error: "SSL connection required"

**Solution**: The settings.py already includes SSL mode. Ensure your database provider supports SSL.

### Error: "relation does not exist"

**Solution**: Migrations haven't run. Check Vercel build logs.

### Database is Empty After Deployment

**Solution**: 
1. Check if migrations ran in build logs
2. Manually run migrations using Vercel CLI
3. Populate initial data using management commands

---

## 💾 Data Migration from SQLite to PostgreSQL

If you have existing data in SQLite:

### Step 1: Dump Data

```bash
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 > data.json
```

### Step 2: Load to PostgreSQL

```bash
# Set DATABASE_URL to your PostgreSQL
python manage.py migrate
python manage.py loaddata data.json
```

---

## 📊 Database Comparison

| Provider | Free Tier | Storage | Best For |
|----------|-----------|---------|----------|
| **Vercel Postgres** | Limited | 256MB | Vercel projects (easiest integration) |
| **Railway** | $5 credit | 512MB | Small to medium projects |
| **Neon** | Yes | 3GB | Serverless, auto-scaling |
| **ElephantSQL** | Yes | 20MB | Small projects, testing |
| **Supabase** | Yes | 500MB | Projects needing real-time features |

---

## 🎯 Recommended Setup (Easiest Path)

1. **Use Vercel Postgres** (native integration)
2. Let Vercel auto-configure environment variables
3. Just add `DATABASE_URL=${POSTGRES_URL}` in Vercel
4. Push your code
5. Done! ✅

---

## 📞 Need Help?

- Vercel Documentation: https://vercel.com/docs/storage/vercel-postgres
- Django PostgreSQL: https://docs.djangoproject.com/en/5.2/ref/databases/#postgresql-notes
- Railway Guide: https://docs.railway.app/databases/postgresql

---

## ✅ Final Notes

✓ Your code is already configured to work with PostgreSQL
✓ Just add environment variables in Vercel
✓ The app will automatically detect and use PostgreSQL
✓ SQLite will still work for local development
