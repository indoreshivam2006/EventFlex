from django.core.management.base import BaseCommand
from EventFlex_app.models import UserProfile, Job, Application, Review


class Command(BaseCommand):
    help = 'Display summary of reputation system data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('\n=== REPUTATION SYSTEM SUMMARY ===\n'))
        
        # Staff statistics
        staff_profiles = UserProfile.objects.filter(user_type='staff')
        self.stdout.write(self.style.WARNING(f'STAFF MEMBERS: {staff_profiles.count()}'))
        
        for profile in staff_profiles:
            self.stdout.write(f'\n📊 {profile.user.username}:')
            self.stdout.write(f'   Badge: {profile.get_badge_display()}')
            self.stdout.write(f'   Rating: {profile.average_rating}/5.0')
            self.stdout.write(f'   Reviews: {profile.total_reviews}')
            self.stdout.write(f'   Completed Events: {profile.total_events_completed}')
        
        # Review statistics
        total_reviews = Review.objects.count()
        self.stdout.write(self.style.WARNING(f'\n\nTOTAL REVIEWS: {total_reviews}'))
        
        # Completed jobs without reviews
        completed_jobs = Job.objects.filter(status='completed')
        self.stdout.write(self.style.WARNING(f'\nCOMPLETED JOBS: {completed_jobs.count()}'))
        
        jobs_needing_reviews = 0
        for job in completed_jobs:
            hired_staff = Application.objects.filter(job=job, status='accepted')
            for app in hired_staff:
                review_exists = Review.objects.filter(
                    job=job, 
                    staff=app.applicant
                ).exists()
                if not review_exists:
                    jobs_needing_reviews += 1
        
        self.stdout.write(f'Staff members needing reviews: {jobs_needing_reviews}')
        
        # Badge distribution
        rising_star = staff_profiles.filter(badge='rising_star').count()
        pro = staff_profiles.filter(badge='pro').count()
        elite = staff_profiles.filter(badge='elite').count()
        
        self.stdout.write(self.style.SUCCESS('\n\nBADGE DISTRIBUTION:'))
        self.stdout.write(f'⭐ Rising Star: {rising_star}')
        self.stdout.write(f'🏆 Pro: {pro}')
        self.stdout.write(f'👑 Elite: {elite}')
        
        self.stdout.write(self.style.SUCCESS('\n=== END SUMMARY ===\n'))
