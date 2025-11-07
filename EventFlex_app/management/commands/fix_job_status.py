from django.core.management.base import BaseCommand
from EventFlex_app.models import Job

class Command(BaseCommand):
    help = 'Update jobs with NULL status to active'

    def handle(self, *args, **options):
        # Update jobs with NULL status
        updated = Job.objects.filter(status__isnull=True).update(status='active')
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated} jobs with NULL status to active'))
        
        # Also ensure any empty string statuses are set to active
        updated_empty = Job.objects.filter(status='').update(status='active')
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_empty} jobs with empty status to active'))
        
        # Show summary
        active_count = Job.objects.filter(status='active').count()
        completed_count = Job.objects.filter(status='completed').count()
        cancelled_count = Job.objects.filter(status='cancelled').count()
        
        self.stdout.write(self.style.SUCCESS(f'\nCurrent job status breakdown:'))
        self.stdout.write(f'  Active: {active_count}')
        self.stdout.write(f'  Completed: {completed_count}')
        self.stdout.write(f'  Cancelled: {cancelled_count}')
