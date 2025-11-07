# JWT Authentication API Testing with Postman

## 🎯 Overview
EventFlex now supports **JWT (JSON Web Token) authentication** with dual-mode support:
- **Web Mode**: JWT tokens stored in HTTP-only cookies (automatic)
- **API/Mobile Mode**: JWT tokens in response body for manual management

---

## 📋 Base URL
```
http://127.0.0.1:8000/api
```

---

## 🔐 Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /auth/register/`

**Headers:**
```
Content-Type: application/json
```

**For Mobile/API (to get token in response):**
```
X-Platform: mobile
```

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123",
  "user_type": "organizer",
  "city": "Mumbai"
}
```

**Response (Web Mode - without X-Platform header):**
```json
{
  "message": "registered",
  "user": {
    "username": "testuser",
    "id": 1
  },
  "profile": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "user_type": "organizer",
    "city": "Mumbai"
  }
}
```
*Note: JWT tokens are set as HTTP-only cookies automatically*

**Response (Mobile Mode - with X-Platform: mobile header):**
```json
{
  "message": "registered",
  "user": {
    "username": "testuser",
    "id": 1
  },
  "profile": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "user_type": "organizer",
    "city": "Mumbai"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login/`

**Headers:**
```
Content-Type: application/json
```

**For Mobile/API:**
```
X-Platform: mobile
```

**Request Body:**
```json
{
  "username": "testuser",
  "password": "testpass123"
}
```

**Or login with email:**
```json
{
  "username": "test@example.com",
  "password": "testpass123"
}
```

**Response (Web Mode):**
```json
{
  "message": "logged in",
  "profile": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "user_type": "organizer",
    "city": "Mumbai",
    "bio": "",
    "skills": "",
    "experience": null,
    "hourly_rate": null
  }
}
```
*JWT tokens set in cookies*

**Response (Mobile Mode):**
```json
{
  "message": "logged in",
  "profile": { ... },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

---

### 3. Refresh Access Token

**Endpoint:** `POST /auth/refresh/`

**Headers:**
```
Content-Type: application/json
```

**For Mobile/API (send refresh token in body):**
```
X-Platform: mobile
```

**Request Body (Mobile only):**
```json
{
  "refresh_token": "your_refresh_token_here"
}
```

*For web: refresh token automatically read from cookie*

**Response (Mobile Mode):**
```json
{
  "access_token": "new_access_token_here",
  "token_type": "Bearer",
  "message": "token refreshed"
}
```

**Response (Web Mode):**
```json
{
  "message": "token refreshed"
}
```
*New access token set in cookie*

---

### 4. Logout

**Endpoint:** `POST /auth/logout/`

**No authentication required** (clears cookies)

**Response:**
```json
{
  "message": "logged out"
}
```

---

## 🔑 Using JWT Tokens in Postman

### Method 1: Web Mode (Cookie-Based) - Recommended for Testing

1. **Enable Cookie Handling in Postman:**
   - Go to Settings → General
   - Enable "Automatically follow redirects"
   - Enable "Send cookies"

2. **Login/Register:**
   - Send POST request to `/auth/login/`
   - **Don't include** `X-Platform: mobile` header
   - Postman will automatically store cookies

3. **Test Protected Endpoints:**
   - Just send requests normally
   - Cookies are sent automatically
   - No need to manually add tokens!

**Example: Get My Jobs**
```
GET /jobs/my/
```
No headers needed - cookie sent automatically! ✅

---

### Method 2: Mobile/API Mode (Header-Based)

1. **Login with Mobile Header:**
```
POST /auth/login/
Headers:
  Content-Type: application/json
  X-Platform: mobile
```

2. **Copy access_token from response**

3. **Create Environment Variable:**
   - In Postman, create variable: `jwt_token`
   - Set value to the access token

4. **Use Token in Protected Requests:**
```
Headers:
  Authorization: Bearer {{jwt_token}}
```

**Example: Get My Jobs**
```
GET /jobs/my/
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Testing Protected Endpoints

### Get My Jobs (Organizer Only)

**Endpoint:** `GET /jobs/my/`

**Web Mode:** No headers needed (cookie automatic)

**Mobile Mode:**
```
Headers:
  Authorization: Bearer {{jwt_token}}
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Wedding Photographer Needed",
      "event_type": "Wedding",
      "role": "Photographer",
      "date": "2025-12-15",
      "location": "Mumbai",
      "pay_rate": "5000.00",
      "status": "active"
    }
  ],
  "count": 1
}
```

---

### Create Job (Organizer Only)

**Endpoint:** `POST /jobs/create/`

**Web Mode:** No auth headers needed

**Mobile Mode:**
```
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Wedding Photographer Needed",
  "description": "Looking for experienced photographer",
  "event_type": "Wedding",
  "role": "Photographer",
  "date": "2025-12-15",
  "start_time": "10:00",
  "end_time": "18:00",
  "location": "Mumbai, Maharashtra",
  "pay_rate": 5000,
  "payment_type": "event",
  "number_of_staff": 2,
  "requirements": "Professional camera required",
  "skills": "Photography, Photo editing"
}
```

---

### Get All Jobs (Public)

**Endpoint:** `GET /jobs/`

**No authentication required**

**Query Parameters (optional):**
```
?event_type=Wedding
?role=Photographer
?location=Mumbai
?page=1
```

---

### Apply for Job (Staff Only)

**Endpoint:** `POST /jobs/{job_id}/apply/`

**Example:** `POST /jobs/1/apply/`

**Headers (Mobile):**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "cover_letter": "I am interested in this position...",
  "expected_compensation": 6000,
  "availability": "I am available on the specified dates",
  "skills": "Photography, Video editing",
  "interest": "Very interested in wedding photography",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210"
}
```

---

## 🧪 Postman Collection Setup

### Create Environment

1. Click **Environments** → **Create Environment**
2. Name it: `EventFlex JWT`
3. Add variables:
```
base_url: http://127.0.0.1:8000/api
jwt_token: (leave empty - will be set after login)
refresh_token: (leave empty)
```

### Auto-Update Token After Login (Advanced)

1. In Login request → **Tests** tab
2. Add this script:
```javascript
// Auto-save token after login
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.access_token) {
        pm.environment.set("jwt_token", jsonData.access_token);
        pm.environment.set("refresh_token", jsonData.refresh_token);
        console.log("Tokens saved to environment!");
    }
}
```

Now tokens are automatically saved! 🎉

---

## 🔍 Token Inspection

### Decode JWT Token (jwt.io)

1. Copy your access token
2. Go to https://jwt.io/
3. Paste token in "Encoded" section
4. See decoded payload:
```json
{
  "user_id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "exp": 1733672400,
  "iat": 1733068400,
  "type": "access"
}
```

---

## ⚠️ Error Responses

### Invalid Credentials
```json
{
  "error": "invalid credentials"
}
```
Status: 401

### Token Expired
```json
{
  "error": "Authentication required"
}
```
Status: 401
*Solution: Use refresh token endpoint*

### Permission Denied
```json
{
  "error": "only organizers can post jobs"
}
```
Status: 403

---

## 🎓 Testing Scenarios

### Scenario 1: Complete Web Flow (Cookie-Based)
```
1. POST /auth/register/ (no X-Platform header)
   → Cookies set automatically

2. GET /jobs/my/
   → Authenticated via cookie ✅

3. POST /auth/logout/
   → Cookies cleared
```

### Scenario 2: Complete Mobile Flow (Token-Based)
```
1. POST /auth/login/
   Headers: X-Platform: mobile
   → Save access_token from response

2. GET /jobs/my/
   Headers: Authorization: Bearer {token}
   → Authenticated via header ✅

3. Wait 7 days (or test expired token)

4. POST /auth/refresh/
   Body: { "refresh_token": "..." }
   → Get new access token

5. Continue using new token
```

### Scenario 3: Test Authorization
```
1. Login as STAFF user
2. Try POST /jobs/create/
   → Should get 403 error (only organizers) ✅

3. Login as ORGANIZER
4. Try POST /jobs/create/
   → Should succeed ✅
```

---

## 📊 Token Lifetimes

| Token Type | Lifetime | Usage |
|------------|----------|-------|
| Access Token | 7 days | All API requests |
| Refresh Token | 30 days | Get new access token |

---

## 🚀 Quick Start Checklist

- [ ] Start Django server: `python manage.py runserver`
- [ ] Open Postman
- [ ] Import environment variables
- [ ] Register new user with `X-Platform: mobile` header
- [ ] Save access token from response
- [ ] Test protected endpoint with token
- [ ] Success! 🎉

---

## 💡 Pro Tips

1. **For Frontend Testing:** Don't use `X-Platform: mobile` header - let cookies work automatically
2. **For Mobile App:** Always include `X-Platform: mobile` to get tokens in response
3. **Token Storage:** Web uses cookies, Mobile should use secure storage (not localStorage)
4. **Debugging:** Check Postman cookies tab to see stored cookies
5. **Refresh Tokens:** Only needed when access token expires (7 days)

---

## 🔗 Useful Postman Features

### View Cookies
```
Postman → Cookies button (top right)
→ See all cookies for domain
```

### View Headers
```
In response → Headers tab
→ See Set-Cookie headers
```

### Console
```
View → Show Postman Console
→ See all requests/responses in detail
```

---

## ✅ Verification Checklist

Test each endpoint:
- [ ] POST /auth/register/ (web mode - no X-Platform)
- [ ] POST /auth/register/ (mobile mode - with X-Platform)
- [ ] POST /auth/login/ (web mode)
- [ ] POST /auth/login/ (mobile mode)
- [ ] GET /jobs/my/ (with cookie)
- [ ] GET /jobs/my/ (with Authorization header)
- [ ] POST /auth/refresh/ (web mode)
- [ ] POST /auth/refresh/ (mobile mode)
- [ ] POST /auth/logout/
- [ ] Verify 401 error when token missing
- [ ] Verify 403 error for wrong user type

---

## 📞 Support

If you encounter issues:
1. Check Django server logs
2. Verify token in jwt.io
3. Check Postman console for request details
4. Ensure PyJWT is installed: `pip install PyJWT`

---

**Happy Testing! 🎉**
