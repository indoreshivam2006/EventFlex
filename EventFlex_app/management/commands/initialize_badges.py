from django.core.management.base import BaseCommand
from EventFlex_app.models import UserProfile


class Command(BaseCommand):
    help = 'Initialize badges for all existing users'

    def handle(self, *args, **kwargs):
        # Get all user profiles
        profiles = UserProfile.objects.all()
        
        updated_count = 0
        for profile in profiles:
            # Set default badge to rising_star if empty or update based on existing reviews
            if not profile.badge or profile.badge == '':
                profile.badge = 'rising_star'
                profile.save()
                updated_count += 1
                self.stdout.write(f"Set {profile.user.username} to Rising Star")
            else:
                # Update badge based on current rating
                old_badge = profile.badge
                profile.update_badge()
                if old_badge != profile.badge:
                    updated_count += 1
                    self.stdout.write(f"Updated {profile.user.username}: {old_badge} → {profile.badge}")
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully initialized/updated {updated_count} user badges'))
        self.stdout.write(f'Total users: {profiles.count()}')
