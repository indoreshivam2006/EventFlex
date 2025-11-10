# 🔑 Generate SECRET_KEY for Vercel

## Quick Command (Copy & Paste in Terminal)

### For Windows PowerShell:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Example Output:
```
django-insecure-k#7x9@2w$n5v!m8p^q&3r*t6y+h=j-l%c~d/f>g<b]a[e{z}
```

**Copy this entire string** and use it as your SECRET_KEY in Vercel.

---

## Step-by-Step: Adding Environment Variables in Vercel

### 1. Open Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2. Select Your Project
- Click on **EventFlex** project

### 3. Go to Settings
- Click **"Settings"** tab

### 4. Click Environment Variables
- Scroll down to **"Environment Variables"** section

### 5. Add Variables

#### Add SECRET_KEY:
```
Key: SECRET_KEY
Value: (paste the generated key from terminal)
Environment: All (Production, Preview, Development)
```
Click **"Save"**

#### Add DEBUG:
```
Key: DEBUG
Value: False
Environment: All
```
Click **"Save"**

#### Add ALLOWED_HOSTS:
```
Key: ALLOWED_HOSTS
Value: .vercel.app
Environment: All
```
Click **"Save"**

#### Add DATABASE_URL (after creating database):
```
Key: DATABASE_URL
Value: (your database connection string)
Environment: All
```
Click **"Save"**

---

## Database URL Examples

### Vercel Postgres:
```
DATABASE_URL=${POSTGRES_URL}
```
(Vercel auto-fills this)

### Railway:
```
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

### Neon:
```
DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### ElephantSQL:
```
DATABASE_URL=postgres://username:password@raja.db.elephantsql.com/username
```

---

## ✅ Verification

After adding all variables, you should see:

```
✓ SECRET_KEY
✓ DEBUG
✓ ALLOWED_HOSTS
✓ DATABASE_URL
```

Then click **"Redeploy"** to apply changes.
