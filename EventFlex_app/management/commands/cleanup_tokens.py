"""
Management command to clean up expired JWT tokens from blacklist
Usage: python manage.py cleanup_tokens
"""

from django.core.management.base import BaseCommand
from EventFlex_app.jwt_utils import cleanup_expired_tokens


class Command(BaseCommand):
    help = 'Clean up expired JWT tokens from blacklist'

    def handle(self, *args, **options):
        self.stdout.write('Cleaning up expired tokens...')
        
        count = cleanup_expired_tokens()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {count} expired token(s)')
        )
