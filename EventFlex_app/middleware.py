"""
JWT Authentication Middleware for EventFlex
Automatically authenticates users based on JWT tokens from cookies or headers
"""

from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from .jwt_utils import verify_jwt_token, get_token_from_request


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to authenticate users using JWT tokens
    
    This middleware:
    1. Extracts JWT token from cookies (for web) or Authorization header (for mobile/API)
    2. Verifies the token
    3. Sets request.user to the authenticated user
    4. Falls back to AnonymousUser if token is invalid/missing
    
    Works seamlessly with existing Django auth - no frontend changes needed!
    """
    
    def process_request(self, request):
        """Process incoming request and authenticate via JWT"""
        
        # Skip JWT auth for admin panel (use Django session auth there)
        if request.path.startswith('/admin/'):
            return None
        
        # Get token from request (cookie or header)
        token = get_token_from_request(request)
        
        if token:
            # Verify token and get user
            user = verify_jwt_token(token)
            
            if user:
                # Set authenticated user
                request.user = user
                request.jwt_authenticated = True
                # Mark that we used JWT so we don't fall back to sessions
                request._jwt_authenticated_override = True
            else:
                # Invalid/expired/blacklisted token - force anonymous
                request.user = AnonymousUser()
                request.jwt_authenticated = False
                # Override any session authentication
                request._jwt_authenticated_override = True
        # If no JWT token, allow session authentication for backward compatibility
        # (only for web users who haven't migrated to JWT yet)
        
        return None
