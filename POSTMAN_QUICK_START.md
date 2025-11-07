# 🚀 Quick Postman Login Testing Guide

## Step-by-Step Instructions for Testing Login with Postman

---

## 📋 Prerequisites

1. ✅ Django server is running: `python manage.py runserver`
2. ✅ Server at: `http://127.0.0.1:8000`
3. ✅ Postman installed

---

## 🎯 Option 1: Test Web Login (Cookie-Based) - Recommended

### Step 1: Enable Cookies in Postman
1. Open Postman
2. Go to **Settings** (⚙️ icon or File → Settings)
3. Go to **General** tab
4. Make sure these are enabled:
   - ✅ **Send cookies**
   - ✅ **Automatically follow redirects**

### Step 2: Create Login Request

1. Click **New** → **HTTP Request**
2. Set method to **POST**
3. Enter URL:
   ```
   http://127.0.0.1:8000/api/auth/login/
   ```

4. Go to **Headers** tab, add:
   ```
   Content-Type: application/json
   ```

5. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from dropdown
   - Enter this JSON:
   ```json
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

6. Click **Send** ✅

### Step 3: Check Response

**Successful Login Response:**
```json
{
  "message": "logged in",
  "profile": {
    "id": 1,
    "username": "your_username",
    "email": "user@example.com",
    "user_type": "organizer",
    "city": "Mumbai",
    "bio": "",
    "skills": "",
    "experience": null,
    "hourly_rate": null
  }
}
```

### Step 4: Verify JWT Cookie

1. In Postman, click **Cookies** (below the Send button)
2. You should see:
   ```
   jwt_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   jwt_refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

✅ **JWT tokens are set!** You're authenticated!

### Step 5: Test Protected Endpoint

1. Create new request: **GET**
2. URL:
   ```
   http://127.0.0.1:8000/api/jobs/my/
   ```
   (for organizers)
   
   OR
   
   ```
   http://127.0.0.1:8000/api/applications/
   ```
   (for staff)

3. **Don't add any headers** - cookies sent automatically!
4. Click **Send**
5. You should get data (not 401 Unauthorized) ✅

---

## 🎯 Option 2: Test Mobile Login (Token in Response) - For API/Mobile

### Step 1: Create Mobile Login Request

1. Click **New** → **HTTP Request**
2. Set method to **POST**
3. Enter URL:
   ```
   http://127.0.0.1:8000/api/auth/login/
   ```

4. Go to **Headers** tab, add:
   ```
   Content-Type: application/json
   X-Platform: mobile
   ```
   ⚠️ **Important:** The `X-Platform: mobile` header makes it return token in body!

5. Go to **Body** tab:
   - Select **raw**
   - Select **JSON**
   - Enter:
   ```json
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

6. Click **Send**

### Step 2: Check Response

**Mobile Login Response:**
```json
{
  "message": "logged in",
  "profile": {
    "id": 1,
    "username": "your_username",
    "user_type": "organizer"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3QiLCJleHAiOjE3MzM2NzI0MDB9.abc123",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MzYyNjA0MDB9.def456",
  "token_type": "Bearer"
}
```

### Step 3: Copy Access Token

1. Copy the `access_token` value from response
2. Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 4: Use Token in Protected Request

1. Create new request: **GET**
2. URL:
   ```
   http://127.0.0.1:8000/api/jobs/my/
   ```

3. Go to **Headers** tab, add:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
   ```
   
   Example:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3QiLCJleHAiOjE3MzM2NzI0MDB9.abc123
   ```

4. Click **Send**
5. You should get data! ✅

---

## 🔥 Pro Tips for Postman

### Tip 1: Save Token as Environment Variable

1. After mobile login, go to **Tests** tab in login request
2. Add this script:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       if (jsonData.access_token) {
           pm.environment.set("jwt_token", jsonData.access_token);
       }
   }
   ```
3. Now token auto-saves after login!

4. In other requests, use in Headers:
   ```
   Authorization: Bearer {{jwt_token}}
   ```

### Tip 2: Create Postman Collection

1. Click **Collections** → **Create Collection**
2. Name it: "EventFlex API"
3. Add folders:
   - Authentication
   - Jobs
   - Applications
4. Save all your requests in folders
5. Easy to organize and reuse!

### Tip 3: View Cookies

1. Click **Cookies** button (below Send button)
2. See all cookies for `127.0.0.1`
3. Can manually add/delete cookies

---

## 📝 Complete Testing Workflow

### Test Organizer Login:

```
1. POST /api/auth/login/
   Body: { "username": "organizer1", "password": "pass123" }
   
2. Check response has profile with user_type: "organizer"

3. Check Cookies tab has jwt_token

4. GET /api/jobs/my/
   (cookies sent automatically)
   
5. Should return organizer's jobs ✅
```

### Test Staff Login:

```
1. POST /api/auth/login/
   Body: { "username": "staff1", "password": "pass123" }
   
2. Check response has profile with user_type: "staff"

3. Check Cookies tab has jwt_token

4. GET /api/applications/
   (cookies sent automatically)
   
5. Should return staff's applications ✅
```

---

## ❌ Common Errors & Solutions

### Error: "invalid credentials"
**Solution:** Check username and password are correct

### Error: "Authentication required" (401)
**Solution:** 
- Web mode: Check cookies are enabled and set
- Mobile mode: Check Authorization header is correct

### Error: "POST required" (400)
**Solution:** Make sure method is POST, not GET

### Error: Connection refused
**Solution:** Make sure Django server is running!
```bash
python manage.py runserver
```

### Error: CSRF token missing
**Solution:** Login/Register endpoints have `@csrf_exempt`, should work without CSRF token

---

## 🎬 Quick Start (Copy-Paste Ready)

### 1. Login Request (Web Mode)
```
Method: POST
URL: http://127.0.0.1:8000/api/auth/login/
Headers: Content-Type: application/json
Body (JSON):
{
  "username": "test",
  "password": "test123"
}
```

### 2. Login Request (Mobile Mode)
```
Method: POST
URL: http://127.0.0.1:8000/api/auth/login/
Headers: 
  Content-Type: application/json
  X-Platform: mobile
Body (JSON):
{
  "username": "test",
  "password": "test123"
}
```

### 3. Protected Request (Cookie Auth)
```
Method: GET
URL: http://127.0.0.1:8000/api/jobs/my/
Headers: (none needed - cookies automatic)
```

### 4. Protected Request (Token Auth)
```
Method: GET
URL: http://127.0.0.1:8000/api/jobs/my/
Headers: 
  Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📸 Visual Guide

### Login Request Setup:
```
┌─────────────────────────────────────┐
│ POST  http://127.0.0.1:8000/api... │ Send
├─────────────────────────────────────┤
│ Headers  Body  Auth  Tests          │
├─────────────────────────────────────┤
│ Body:                               │
│ ○ none  ○ form-data  ● raw  ○ binary│
│                                      │
│ JSON ▼                               │
│ ┌──────────────────────────────────┐│
│ │ {                                ││
│ │   "username": "test",            ││
│ │   "password": "test123"          ││
│ │ }                                ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Response with Cookies:
```
Response ✅ 200 OK
┌─────────────────────────────────────┐
│ Body  Cookies  Headers  Test Results│
├─────────────────────────────────────┤
│ {                                   │
│   "message": "logged in",           │
│   "profile": { ... }                │
│ }                                   │
└─────────────────────────────────────┘

Cookies (2):
┌─────────────────────────────────────┐
│ jwt_token: eyJhbGc...               │
│ jwt_refresh_token: eyJhbGc...       │
└─────────────────────────────────────┘
```

---

## ✅ Success Checklist

Test login is working if:
- [ ] Login request returns 200 OK
- [ ] Response has `"message": "logged in"`
- [ ] Response has `profile` with user details
- [ ] Cookies tab shows `jwt_token` (web mode)
- [ ] OR Response has `access_token` (mobile mode)
- [ ] Protected endpoints return data (not 401)
- [ ] Logout clears cookies

---

## 🎉 That's It!

You're now ready to test JWT authentication with Postman!

**Quick Summary:**
1. ✅ Start server
2. ✅ Open Postman
3. ✅ POST to /api/auth/login/
4. ✅ Check cookies or token in response
5. ✅ Test protected endpoints
6. ✅ Success! 🎊

For more details, see: **POSTMAN_JWT_TESTING.md**
