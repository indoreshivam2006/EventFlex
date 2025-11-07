"""
JWT Token Utilities for EventFlex
Handles JWT token generation, validation, and decoding
"""

import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone


def is_token_blacklisted(token):
    """
    Check if a token is blacklisted
    
    Args:
        token: JWT token string
    
    Returns:
        bool: True if blacklisted, False otherwise
    """
    from .models import BlacklistedToken
    return BlacklistedToken.objects.filter(token=token).exists()


def blacklist_token(token, user, reason='logout'):
    """
    Add a token to the blacklist
    
    Args:
        token: JWT token string
        user: Django User object
        reason: Reason for blacklisting (default: 'logout')
    
    Returns:
        BlacklistedToken: Created blacklist entry
    """
    from .models import BlacklistedToken
    
    # Decode to get expiration
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        expires_at = timezone.make_aware(datetime.fromtimestamp(payload['exp']))
    except:
        expires_at = timezone.now() + timedelta(days=7)  # Default expiry
    
    return BlacklistedToken.objects.create(
        token=token,
        user=user,
        expires_at=expires_at,
        reason=reason
    )


def cleanup_expired_tokens():
    """
    Delete expired tokens from blacklist (should be run periodically)
    
    Returns:
        int: Number of tokens deleted
    """
    from .models import BlacklistedToken
    count, _ = BlacklistedToken.objects.filter(expires_at__lt=timezone.now()).delete()
    return count


def generate_jwt_token(user):
    """
    Generate JWT access token for a user
    
    Args:
        user: Django User object
    
    Returns:
        str: JWT token string
    """
    now = datetime.utcnow()
    payload = {
        'user_id': user.id,
        'username': user.username,
        # Email removed for security - sensitive PII should not be in tokens
        'exp': now + timedelta(days=getattr(settings, 'JWT_ACCESS_TOKEN_LIFETIME', 7)),
        'iat': now,  # Issued at
        'type': 'access'
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def generate_refresh_token(user):
    """
    Generate JWT refresh token for a user (longer expiry)
    
    Args:
        user: Django User object
    
    Returns:
        str: Refresh token string
    """
    now = datetime.utcnow()
    payload = {
        'user_id': user.id,
        'exp': now + timedelta(days=getattr(settings, 'JWT_REFRESH_TOKEN_LIFETIME', 30)),
        'iat': now,
        'type': 'refresh'
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def decode_jwt_token(token):
    """
    Decode and validate JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        dict: Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Invalid token
        return None


def verify_jwt_token(token):
    """
    Verify JWT token and return user
    
    Args:
        token: JWT token string
    
    Returns:
        User: Django User object or None if invalid
    """
    # Check if token is blacklisted
    if is_token_blacklisted(token):
        return None
    
    payload = decode_jwt_token(token)
    
    if not payload:
        return None
    
    try:
        user = User.objects.get(id=payload['user_id'])
        return user
    except User.DoesNotExist:
        return None


def get_token_from_request(request):
    """
    Extract JWT token from request (cookie or Authorization header)
    
    Args:
        request: Django request object
    
    Returns:
        str: Token string or None
    """
    # First try to get from cookie (for web app)
    token = request.COOKIES.get('jwt_token')
    
    if token:
        return token
    
    # Then try Authorization header (for mobile/API clients)
    auth_header = request.headers.get('Authorization', '')
    
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    
    return None
