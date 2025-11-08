from django.core.management.base import BaseCommand
from EventFlex_app.models import UserProfile, Application, Job


class Command(BaseCommand):
    help = 'Sync reputation data (completed events count) for all existing users'

    def handle(self, *args, **kwargs):
        # Get all staff profiles
        staff_profiles = UserProfile.objects.filter(user_type='staff')
        
        updated_count = 0
        for profile in staff_profiles:
            # Count accepted applications for completed jobs
            completed_jobs = Application.objects.filter(
                applicant=profile,
                status='accepted',
                job__status='completed'
            ).count()
            
            old_count = profile.total_events_completed
            profile.total_events_completed = completed_jobs
            profile.save()
            
            if old_count != completed_jobs:
                updated_count += 1
                self.stdout.write(
                    f"{profile.user.username}: {old_count} → {completed_jobs} completed events"
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully synced {updated_count} user profiles')
        )
        self.stdout.write(f'Total staff users: {staff_profiles.count()}')
