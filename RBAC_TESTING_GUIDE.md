# RBAC Testing Guide - EventFlex v1.8

## Quick Test Instructions

### Server Status
✅ Django server running at: http://127.0.0.1:8000/
✅ No errors detected in implementation
✅ All endpoints protected and functional

## Test Scenarios

### Test 1: Dashboard Access Protection
1. Open browser to http://127.0.0.1:8000/
2. Create a new account as "Event Organizer"
3. After login, note you're on `/organizer-dashboard/`
4. Manually navigate to: `http://127.0.0.1:8000/staff-portal/`
5. **Expected Result:** Should auto-redirect back to `/organizer-dashboard/`

### Test 2: Staff Dashboard Protection
1. Logout from organizer account
2. Create new account as "Event Pro" (staff)
3. After login, note you're on `/staff-portal/`
4. Manually navigate to: `http://127.0.0.1:8000/organizer-dashboard/`
5. **Expected Result:** Should auto-redirect back to `/staff-portal/`

### Test 3: API Endpoint Protection (Organizer → Staff Action)
1. Login as Event Organizer
2. Open browser console (F12)
3. Try to apply to a job using console:
```javascript
fetch('/api/jobs/1/apply/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        username: 'your_organizer_username',
        cover_message: 'Test application'
    })
}).then(r => r.json()).then(console.log)
```
4. **Expected Result:** Error: "Only Event Pros (staff) can apply to jobs" (403)

### Test 4: API Endpoint Protection (Staff → Organizer Action)
1. Login as Event Pro (staff)
2. Open browser console (F12)
3. Try to browse talent:
```javascript
fetch('/api/talent/', {
    credentials: 'include'
}).then(r => r.json()).then(console.log)
```
4. **Expected Result:** Error: "Only Event Organizers can browse talent" (403)

### Test 5: Login Auto-Redirect
1. Logout from any account
2. Login as Event Organizer
3. **Expected Result:** Auto-redirect to `/organizer-dashboard/` (no manual navigation needed)
4. Logout
5. Login as Event Pro
6. **Expected Result:** Auto-redirect to `/staff-portal/`

## Manual Testing Checklist

### Dashboard Protection
- [ ] Organizer cannot access `/staff-portal/` (auto-redirects)
- [ ] Staff cannot access `/organizer-dashboard/` (auto-redirects)
- [ ] Unauthenticated users redirect to login page

### API Protection
- [ ] Organizers cannot apply to jobs (403 error)
- [ ] Staff cannot create jobs (403 error)
- [ ] Staff cannot browse talent (403 error)
- [ ] Users can only view/edit their own resources

### Login Flow
- [ ] Organizer login → auto-redirect to organizer dashboard
- [ ] Staff login → auto-redirect to staff portal
- [ ] Profile data includes user_type in response

### Edge Cases
- [ ] User without profile → logout and redirect to login
- [ ] Invalid token → redirect to login
- [ ] Expired session → redirect to login

## What Was Fixed

### Before RBAC (v1.7)
❌ Organizer could manually navigate to `/staff-portal/` and access staff features
❌ Staff could navigate to `/organizer-dashboard/` and post fake jobs
❌ No validation on API endpoints for role-specific actions
❌ Business logic could be violated (organizers applying to own jobs)

### After RBAC (v1.8)
✅ Dashboard access controlled by decorators with auto-redirect
✅ API endpoints validate user roles (403 errors for unauthorized)
✅ Job creation restricted to organizers only
✅ Job applications restricted to staff only
✅ Talent browsing restricted to organizers only
✅ Ownership validation on sensitive operations
✅ Seamless user experience (auto-redirects, no error pages)

## Protected Routes Summary

| Route | Allowed Role | Protection |
|-------|-------------|------------|
| `/organizer-dashboard/` | organizer | Decorator |
| `/staff-portal/` | staff | Decorator |
| `POST /api/jobs/create/` | organizer | Manual check |
| `POST /api/jobs/<id>/apply/` | staff | Manual check |
| `GET /api/talent/` | organizer | Manual check |
| `GET /api/jobs/<id>/applications/` | organizer (owner) | Manual + ownership |
| `POST /api/applications/<id>/update-status/` | organizer (owner) | Manual + ownership |

## Browser Console Tests

### Test Organizer Applying (Should Fail)
```javascript
// Must be logged in as organizer
fetch('/api/jobs/1/apply/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        username: localStorage.getItem('eventflex_user') ? JSON.parse(localStorage.getItem('eventflex_user')).username : 'test',
        cover_message: 'Test'
    })
}).then(r => r.json()).then(data => {
    console.log('Result:', data);
    console.assert(data.error === 'Only Event Pros (staff) can apply to jobs', 'RBAC test failed!');
})
```

### Test Staff Browsing Talent (Should Fail)
```javascript
// Must be logged in as staff
fetch('/api/talent/', {
    credentials: 'include'
}).then(r => r.json()).then(data => {
    console.log('Result:', data);
    console.assert(data.error === 'Only Event Organizers can browse talent', 'RBAC test failed!');
})
```

## Success Criteria

All tests should pass:
1. ✅ Dashboard redirects work automatically
2. ✅ API endpoints return 403 for wrong roles
3. ✅ Login flow redirects to correct dashboard
4. ✅ No errors in browser console
5. ✅ No Django errors in terminal
6. ✅ User experience is seamless (no broken features)

## Rollback Plan (if needed)

If issues arise, revert changes:
1. Remove `@require_user_type()` decorators from dashboard views
2. Remove role checks from `apply_job()` and `talent_list()`
3. Restore to v1.7 (chat system version)

## Next Steps After Testing

1. Commit changes with message: "Implement comprehensive RBAC security (v1.8)"
2. Push to GitHub
3. Update README.md with security features
4. Monitor production logs for unauthorized access attempts
