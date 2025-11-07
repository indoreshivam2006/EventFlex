from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from EventFlex_app.models import UserProfile, Job, Application, Transaction
from datetime import date, time, datetime, timedelta
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with sample data for EventFlex'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample users...')
        
        # Create organizers
        org1_user, created = User.objects.get_or_create(
            username='techevents',
            defaults={'email': 'contact@techevents.in', 'first_name': 'TechEvents', 'last_name': 'India'}
        )
        if created:
            org1_user.set_password('password123')
            org1_user.save()
        
        org1, _ = UserProfile.objects.get_or_create(
            user=org1_user,
            defaults={
                'user_type': 'organizer',
                'city': 'Mumbai',
                'phone': '+91 98765 43210',
                'bio': 'Leading tech conference organizer in India',
                'kyc_verified': True,
            }
        )

        org2_user, created = User.objects.get_or_create(
            username='elegantweddings',
            defaults={'email': 'info@elegantweddings.in', 'first_name': 'Elegant', 'last_name': 'Weddings'}
        )
        if created:
            org2_user.set_password('password123')
            org2_user.save()
        
        org2, _ = UserProfile.objects.get_or_create(
            user=org2_user,
            defaults={
                'user_type': 'organizer',
                'city': 'Delhi',
                'phone': '+91 98765 43211',
                'bio': 'Premium wedding planning services',
                'kyc_verified': True,
            }
        )

        # Create mithun organizer for testing
        mithun_user, created = User.objects.get_or_create(
            username='mithun',
            defaults={'email': 'mithun@eventflex.com', 'first_name': 'Mithun', 'last_name': 'Kumar'}
        )
        if created:
            mithun_user.set_password('password123')
            mithun_user.save()
        
        mithun_profile, _ = UserProfile.objects.get_or_create(
            user=mithun_user,
            defaults={
                'user_type': 'organizer',
                'city': 'Bangalore',
                'phone': '+91 99999 88888',
                'bio': 'Passionate event organizer specializing in corporate events',
                'kyc_verified': True,
            }
        )

        # Create event pros (staff)
        staff_data = [
            {
                'username': 'priya_kumar',
                'email': 'priya.kumar@email.com',
                'first_name': 'Priya',
                'last_name': 'Kumar',
                'city': 'Mumbai',
                'phone': '+91 98765 43212',
                'bio': 'Experienced event coordinator with 3+ years in the industry',
                'badge': 'Elite Pro',
                'kyc_verified': True,
                'video_verified': True,
            },
            {
                'username': 'rahul_singh',
                'email': 'rahul.singh@email.com',
                'first_name': 'Rahul',
                'last_name': 'Singh',
                'city': 'Delhi',
                'phone': '+91 98765 43213',
                'bio': 'Registration and check-in specialist',
                'badge': 'Pro',
                'kyc_verified': True,
                'video_verified': True,
            },
            {
                'username': 'anjali_sharma',
                'email': 'anjali.sharma@email.com',
                'first_name': 'Anjali',
                'last_name': 'Sharma',
                'city': 'Bangalore',
                'phone': '+91 98765 43214',
                'bio': 'Hospitality professional with multilingual skills',
                'badge': 'Rising Star',
                'kyc_verified': True,
                'video_verified': False,
            },
            {
                'username': 'vikram_patel',
                'email': 'vikram.patel@email.com',
                'first_name': 'Vikram',
                'last_name': 'Patel',
                'city': 'Pune',
                'phone': '+91 98765 43215',
                'bio': 'Technical support and AV setup expert',
                'badge': 'Pro',
                'kyc_verified': True,
                'video_verified': True,
            },
        ]

        staff_profiles = []
        for data in staff_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name']
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            
            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': 'staff',
                    'city': data['city'],
                    'phone': data['phone'],
                    'bio': data['bio'],
                    'badge': data['badge'],
                    'kyc_verified': data['kyc_verified'],
                    'video_verified': data['video_verified'],
                }
            )
            staff_profiles.append(profile)

        self.stdout.write(self.style.SUCCESS(f'Created {len(staff_profiles)} event pros'))

        # Create sample jobs
        jobs_data = [
            {
                'organizer': org1,
                'title': 'Tech Conference 2025',
                'event_type': 'conference',
                'role': 'Event Coordinator',
                'number_of_staff': 2,
                'skills': 'Event Management, Coordination, Leadership',
                'date': date(2025, 12, 1),
                'start_time': time(9, 0),
                'end_time': time(18, 0),
                'location': 'Mumbai Convention Center',
                'pay_rate': 3000.00,
                'payment_type': 'daily',
                'description': 'Looking for experienced event coordinators for a tech conference. Must have excellent communication skills.',
                'requirements': 'Experience Required (1+ years), KYC Verified Only',
            },
            {
                'organizer': org1,
                'title': 'Corporate Workshop',
                'event_type': 'corporate',
                'role': 'Registration Desk Staff',
                'number_of_staff': 5,
                'skills': 'Registration, Customer Service, Computer Skills',
                'date': date(2025, 12, 5),
                'start_time': time(8, 0),
                'end_time': time(17, 0),
                'location': 'Bangalore Tech Park',
                'pay_rate': 2000.00,
                'payment_type': 'daily',
                'description': 'Need friendly staff for registration desk at corporate workshop.',
                'requirements': 'Basic computer skills required',
            },
            {
                'organizer': org2,
                'title': 'Wedding Reception',
                'event_type': 'wedding',
                'role': 'Hospitality Staff',
                'number_of_staff': 8,
                'skills': 'Hospitality, Guest Relations, Professional Attire',
                'date': date(2025, 12, 8),
                'start_time': time(16, 0),
                'end_time': time(23, 59),
                'location': 'Delhi Banquet Hall',
                'pay_rate': 2500.00,
                'payment_type': 'event',
                'description': 'Seeking professional hospitality staff for high-end wedding reception.',
                'requirements': 'Must be well-groomed and experienced',
            },
            {
                'organizer': org2,
                'title': 'Music Festival',
                'event_type': 'festival',
                'role': 'Stage Manager',
                'number_of_staff': 3,
                'skills': 'Stage Management, Coordination, Technical Knowledge',
                'date': date(2025, 11, 25),
                'start_time': time(14, 0),
                'end_time': time(23, 0),
                'location': 'Delhi Open Ground',
                'pay_rate': 3500.00,
                'payment_type': 'event',
                'description': 'Looking for experienced stage managers for music festival.',
                'requirements': 'Prior festival experience preferred',
            },
        ]

        jobs = []
        for job_data in jobs_data:
            job, _ = Job.objects.get_or_create(
                title=job_data['title'],
                organizer=job_data['organizer'],
                defaults=job_data
            )
            jobs.append(job)

        self.stdout.write(self.style.SUCCESS(f'Created {len(jobs)} jobs'))

        # Create sample applications
        applications = []
        if jobs and staff_profiles:
            app1, _ = Application.objects.get_or_create(
                job=jobs[0],
                applicant=staff_profiles[0],
                defaults={
                    'cover_message': 'I have 3 years of experience coordinating tech events.',
                    'status': 'pending'
                }
            )
            applications.append(app1)
            
            app2, _ = Application.objects.get_or_create(
                job=jobs[0],
                applicant=staff_profiles[1],
                defaults={
                    'cover_message': 'Looking forward to working with your team.',
                    'status': 'accepted'
                }
            )
            applications.append(app2)
            
            app3, _ = Application.objects.get_or_create(
                job=jobs[2],
                applicant=staff_profiles[2],
                defaults={
                    'cover_message': 'I specialize in hospitality and guest relations.',
                    'status': 'pending'
                }
            )
            applications.append(app3)

        self.stdout.write(self.style.SUCCESS(f'Created {len(applications)} applications'))

        # Create sample transactions for staff members
        if staff_profiles and applications:
            # Completed transactions for priya_kumar
            Transaction.objects.get_or_create(
                user=staff_profiles[0],
                application=applications[0],
                amount=Decimal('3000.00'),
                status='completed',
                defaults={
                    'note': 'Payment for Tech Conference 2025',
                }
            )
            
            Transaction.objects.get_or_create(
                user=staff_profiles[0],
                amount=Decimal('2500.00'),
                status='completed',
                defaults={
                    'note': 'Payment for previous event',
                }
            )
            
            Transaction.objects.get_or_create(
                user=staff_profiles[0],
                amount=Decimal('2000.00'),
                status='pending',
                defaults={
                    'note': 'Pending payment for recent event',
                }
            )
            
            # Add some older transactions spread over months
            for i in range(1, 7):
                months_ago = datetime.now() - timedelta(days=30 * i)
                txn = Transaction(
                    user=staff_profiles[0],
                    amount=Decimal(str(2000 + (i * 500))),
                    status='completed',
                    note=f'Payment from {months_ago.strftime("%B %Y")}'
                )
                txn.save()
                txn.created_at = months_ago
                txn.save(update_fields=['created_at'])

        self.stdout.write(self.style.SUCCESS('Sample transactions created!'))

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('  Admin: admin / admin123')
        self.stdout.write('  Organizer: techevents / password123')
        self.stdout.write('  Organizer: mithun / password123')
        self.stdout.write('  Staff: priya_kumar / password123')
