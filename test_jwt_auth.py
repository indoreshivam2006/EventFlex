"""
Test script to verify JWT authentication works for both Organizers and Staff
Run this script to test JWT auth implementation
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_registration(user_type, username, email, password):
    """Test user registration with JWT"""
    print(f"\n🔹 Testing {user_type.upper()} Registration...")
    
    # Test Web Mode (Cookie-based)
    response = requests.post(
        f"{BASE_URL}/auth/register/",
        json={
            "username": username,
            "email": email,
            "password": password,
            "user_type": user_type,
            "city": "Mumbai"
        }
    )
    
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Response: {json.dumps(data, indent=2)}")
    
    # Check for JWT cookie
    if 'jwt_token' in response.cookies:
        print(f"   ✅ JWT Cookie Set: {response.cookies['jwt_token'][:50]}...")
    else:
        print(f"   ❌ No JWT Cookie Found")
    
    return response.cookies, data

def test_login(username, password):
    """Test login with JWT"""
    print(f"\n🔹 Testing Login for: {username}")
    
    # Test Web Mode
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={
            "username": username,
            "password": password
        }
    )
    
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   User Type: {data.get('profile', {}).get('user_type', 'N/A')}")
    
    # Check for JWT cookie
    if 'jwt_token' in response.cookies:
        print(f"   ✅ JWT Cookie Set: {response.cookies['jwt_token'][:50]}...")
    else:
        print(f"   No JWT Cookie Found")
    
    return response.cookies, data

def test_mobile_login(username, password):
    """Test mobile/API login (token in response body)"""
    print(f"\n🔹 Testing Mobile Login for: {username}")
    
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        headers={
            "X-Platform": "mobile"
        },
        json={
            "username": username,
            "password": password
        }
    )
    
    print(f"   Status: {response.status_code}")
    data = response.json()
    
    if 'access_token' in data:
        print(f"   ✅ Access Token: {data['access_token'][:50]}...")
        print(f"   ✅ Refresh Token: {data['refresh_token'][:50]}...")
        print(f"   ✅ Token Type: {data.get('token_type')}")
    else:
        print(f"   ❌ No Token in Response")
    
    return data.get('access_token'), data

def test_protected_endpoint_cookie(cookies, user_type):
    """Test protected endpoint with cookie authentication"""
    print(f"\n🔹 Testing Protected Endpoint (Cookie Auth) - {user_type.upper()}")
    
    # Test appropriate endpoint based on user type
    if user_type == 'organizer':
        endpoint = f"{BASE_URL}/jobs/my/"
    else:
        endpoint = f"{BASE_URL}/applications/"
    
    response = requests.get(endpoint, cookies=cookies)
    
    print(f"   Endpoint: {endpoint}")
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ Authentication Successful!")
        data = response.json()
        print(f"   Data: {json.dumps(data, indent=2)[:200]}...")
    elif response.status_code == 401:
        print(f"   ❌ Authentication Failed - Unauthorized")
    elif response.status_code == 403:
        print(f"   ⚠️  Forbidden - Check user permissions")
    else:
        print(f"   ❌ Error: {response.json()}")
    
    return response.status_code == 200

def test_protected_endpoint_header(token, user_type):
    """Test protected endpoint with header authentication"""
    print(f"\n🔹 Testing Protected Endpoint (Bearer Token) - {user_type.upper()}")
    
    # Test appropriate endpoint based on user type
    if user_type == 'organizer':
        endpoint = f"{BASE_URL}/jobs/my/"
    else:
        endpoint = f"{BASE_URL}/applications/"
    
    response = requests.get(
        endpoint,
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    
    print(f"   Endpoint: {endpoint}")
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ Authentication Successful!")
        data = response.json()
        print(f"   Data: {json.dumps(data, indent=2)[:200]}...")
    elif response.status_code == 401:
        print(f"   ❌ Authentication Failed - Unauthorized")
    elif response.status_code == 403:
        print(f"   ⚠️  Forbidden - Check user permissions")
    else:
        print(f"   ❌ Error: {response.json()}")
    
    return response.status_code == 200

def test_logout(cookies):
    """Test logout"""
    print(f"\n🔹 Testing Logout")
    
    response = requests.post(f"{BASE_URL}/auth/logout/", cookies=cookies)
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # Check if cookies are deleted
    if response.cookies.get('jwt_token') == '' or 'jwt_token' not in response.cookies:
        print(f"   ✅ JWT Cookie Cleared")
    
    return response.status_code == 200

def main():
    print_section("JWT AUTHENTICATION TEST SUITE")
    print("Testing JWT authentication for both Organizers and Staff")
    print("\n⚠️  Note: Users will be created. Use unique usernames if running multiple times.")
    
    # Generate unique usernames
    import random
    random_id = random.randint(1000, 9999)
    
    organizer_username = f"test_organizer_{random_id}"
    staff_username = f"test_staff_{random_id}"
    
    organizer_email = f"organizer{random_id}@test.com"
    staff_email = f"staff{random_id}@test.com"
    
    password = "testpass123"
    
    # Test Results
    results = {
        'organizer_registration': False,
        'organizer_login_cookie': False,
        'organizer_login_mobile': False,
        'organizer_protected_cookie': False,
        'organizer_protected_token': False,
        'staff_registration': False,
        'staff_login_cookie': False,
        'staff_login_mobile': False,
        'staff_protected_cookie': False,
        'staff_protected_token': False,
        'logout': False
    }
    
    try:
        # ========== TEST ORGANIZER ==========
        print_section("TESTING EVENT ORGANIZER")
        
        # Register Organizer
        org_cookies, org_data = test_registration('organizer', organizer_username, organizer_email, password)
        results['organizer_registration'] = 'jwt_token' in org_cookies
        
        # Login Organizer (Cookie)
        org_cookies, org_data = test_login(organizer_username, password)
        results['organizer_login_cookie'] = 'jwt_token' in org_cookies
        
        # Test Protected Endpoint (Cookie)
        results['organizer_protected_cookie'] = test_protected_endpoint_cookie(org_cookies, 'organizer')
        
        # Login Organizer (Mobile)
        org_token, org_data = test_mobile_login(organizer_username, password)
        results['organizer_login_mobile'] = org_token is not None
        
        # Test Protected Endpoint (Token)
        if org_token:
            results['organizer_protected_token'] = test_protected_endpoint_header(org_token, 'organizer')
        
        # ========== TEST STAFF ==========
        print_section("TESTING EVENT PRO (STAFF)")
        
        # Register Staff
        staff_cookies, staff_data = test_registration('staff', staff_username, staff_email, password)
        results['staff_registration'] = 'jwt_token' in staff_cookies
        
        # Login Staff (Cookie)
        staff_cookies, staff_data = test_login(staff_username, password)
        results['staff_login_cookie'] = 'jwt_token' in staff_cookies
        
        # Test Protected Endpoint (Cookie)
        results['staff_protected_cookie'] = test_protected_endpoint_cookie(staff_cookies, 'staff')
        
        # Login Staff (Mobile)
        staff_token, staff_data = test_mobile_login(staff_username, password)
        results['staff_login_mobile'] = staff_token is not None
        
        # Test Protected Endpoint (Token)
        if staff_token:
            results['staff_protected_token'] = test_protected_endpoint_header(staff_token, 'staff')
        
        # Test Logout
        results['logout'] = test_logout(org_cookies)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server!")
        print("   Make sure Django server is running: python manage.py runserver")
        return
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # ========== RESULTS SUMMARY ==========
    print_section("TEST RESULTS SUMMARY")
    
    print("\n📊 ORGANIZER TESTS:")
    print(f"   Registration (Cookie):        {'✅ PASS' if results['organizer_registration'] else '❌ FAIL'}")
    print(f"   Login (Cookie):               {'✅ PASS' if results['organizer_login_cookie'] else '❌ FAIL'}")
    print(f"   Login (Mobile):               {'✅ PASS' if results['organizer_login_mobile'] else '❌ FAIL'}")
    print(f"   Protected Endpoint (Cookie):  {'✅ PASS' if results['organizer_protected_cookie'] else '❌ FAIL'}")
    print(f"   Protected Endpoint (Token):   {'✅ PASS' if results['organizer_protected_token'] else '❌ FAIL'}")
    
    print("\n📊 STAFF TESTS:")
    print(f"   Registration (Cookie):        {'✅ PASS' if results['staff_registration'] else '❌ FAIL'}")
    print(f"   Login (Cookie):               {'✅ PASS' if results['staff_login_cookie'] else '❌ FAIL'}")
    print(f"   Login (Mobile):               {'✅ PASS' if results['staff_login_mobile'] else '❌ FAIL'}")
    print(f"   Protected Endpoint (Cookie):  {'✅ PASS' if results['staff_protected_cookie'] else '❌ FAIL'}")
    print(f"   Protected Endpoint (Token):   {'✅ PASS' if results['staff_protected_token'] else '❌ FAIL'}")
    
    print("\n📊 OTHER TESTS:")
    print(f"   Logout:                       {'✅ PASS' if results['logout'] else '❌ FAIL'}")
    
    # Overall result
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    print(f"\n{'='*60}")
    print(f"  OVERALL: {passed_tests}/{total_tests} Tests Passed")
    print(f"{'='*60}")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! JWT authentication works for both user types!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Check the output above.")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
