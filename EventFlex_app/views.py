from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import models as django_models
from .models import UserProfile, Job, Application, Message, Transaction, AutocompleteSuggestion
import json
from datetime import datetime
from decimal import Decimal


# Utility functions
def safe_isoformat(value):
	"""Safely convert date/time to ISO format string"""
	if value is None:
		return None
	if isinstance(value, str):
		return value
	if hasattr(value, 'isoformat'):
		return value.isoformat()
	return str(value)


# Template views for frontend pages
def index_view(request):
	"""Landing page"""
	# Get real statistics
	total_professionals = UserProfile.objects.filter(user_type='staff').count()
	total_events = Job.objects.count()
	
	# Calculate success rate (jobs with accepted applications / total jobs)
	jobs_with_accepted = Application.objects.filter(status='accepted').values('job').distinct().count()
	success_rate = int(((jobs_with_accepted / total_events) * 100)) if total_events > 0 else 98
	
	context = {
		'total_professionals': total_professionals,
		'total_events': total_events,
		'success_rate': success_rate,
	}
	return render(request, 'index.html', context)


def login_page_view(request):
	"""Login page"""
	return render(request, 'login.html')


def signup_page_view(request):
	"""Signup page"""
	# Get real statistics for signup page
	total_professionals = UserProfile.objects.filter(user_type='staff').count()
	total_events = Job.objects.count()
	
	# Calculate success rate (jobs with accepted applications / total jobs)
	jobs_with_accepted = Application.objects.filter(status='accepted').values('job').distinct().count()
	success_rate = int(((jobs_with_accepted / total_events) * 100)) if total_events > 0 else 98
	
	context = {
		'total_professionals': total_professionals,
		'total_events': total_events,
		'success_rate': f"{success_rate}%",
	}
	return render(request, 'signup.html', context)


def staff_portal_view(request):
	"""Staff portal dashboard"""
	return render(request, 'staff-portal.html')


def organizer_dashboard_view(request):
	"""Organizer dashboard"""
	return render(request, 'organizer-dashboard.html')


def api_docs_view(request):
	"""API documentation page"""
	return render(request, 'api-docs.html')


def home(request):
	"""Root URL - API documentation"""
	html = """
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>EventFlex API - Server Running</title>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
		<style>
			* { margin: 0; padding: 0; box-sizing: border-box; }
			
			body { 
				font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				min-height: 100vh;
				padding: 40px 20px;
				color: #333;
			}
			
			.container {
				max-width: 1200px;
				margin: 0 auto;
				background: white;
				border-radius: 20px;
				box-shadow: 0 20px 60px rgba(0,0,0,0.3);
				overflow: hidden;
			}
			
			.header {
				background: linear-gradient(135deg, #0066ff 0%, #00ccff 100%);
				color: white;
				padding: 50px 40px;
				text-align: center;
			}

			.header h1 {
				font-size: 48px;
				font-weight: 800;
				margin-bottom: 15px;
				text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
			}
			
			.status-badge {
				display: inline-flex;
				align-items: center;
				gap: 10px;
				background: rgba(255,255,255,0.2);
				padding: 12px 24px;
				border-radius: 50px;
				font-size: 18px;
				font-weight: 600;
				backdrop-filter: blur(10px);
				margin-top: 10px;
			}
			
			.status-dot {
				width: 12px;
				height: 12px;
				background: #00ff88;
				border-radius: 50%;
				animation: pulse 2s infinite;
			}
			
			@keyframes pulse {
				0%, 100% { transform: scale(1); opacity: 1; }
				50% { transform: scale(1.2); opacity: 0.7; }
			}
			
			.content {
				padding: 40px;
			}
			
			.section {
				margin-bottom: 50px;
			}
			
			.section-title {
				display: flex;
				align-items: center;
				gap: 12px;
				font-size: 28px;
				font-weight: 700;
				margin-bottom: 25px;
				color: #1a1a1a;
			}
			
			.section-title i {
				color: #0066ff;
				font-size: 32px;
			}
			
			.cards-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				gap: 20px;
				margin-top: 20px;
			}
			
			.card {
				background: #f8f9fa;
				border: 2px solid #e9ecef;
				border-radius: 12px;
				padding: 25px;
				transition: all 0.3s ease;
				cursor: pointer;
			}
			
			.card:hover {
				transform: translateY(-5px);
				box-shadow: 0 10px 30px rgba(0,102,255,0.2);
				border-color: #0066ff;
			}
			
			.card h3 {
				font-size: 20px;
				margin-bottom: 10px;
				color: #0066ff;
				display: flex;
				align-items: center;
				gap: 10px;
			}
			
			.card p {
				color: #666;
				line-height: 1.6;
			}
			
			.card a {
				color: #0066ff;
				text-decoration: none;
				font-weight: 600;
				display: inline-flex;
				align-items: center;
				gap: 6px;
				margin-top: 15px;
				transition: gap 0.3s;
			}
			
			.card a:hover {
				gap: 10px;
			}
			
			.endpoint {
				background: white;
				border: 2px solid #e9ecef;
				border-radius: 10px;
				padding: 18px 20px;
				margin-bottom: 12px;
				display: flex;
				align-items: center;
				gap: 15px;
				transition: all 0.3s ease;
			}
			
			.endpoint:hover {
				border-color: #0066ff;
				transform: translateX(5px);
			}
			
			.method {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				padding: 6px 14px;
				border-radius: 6px;
				font-weight: 700;
				font-size: 12px;
				color: white;
				min-width: 60px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}
			
			.get { background: linear-gradient(135deg, #61affe 0%, #4a9fee 100%); }
			.post { background: linear-gradient(135deg, #49cc90 0%, #3ab87a 100%); }
			
			.endpoint-path {
				font-family: 'Monaco', 'Courier New', monospace;
				font-size: 15px;
				font-weight: 600;
				color: #333;
				flex: 1;
			}
			
			.endpoint-desc {
				color: #666;
				font-size: 14px;
			}
			
			.file-list {
				display: grid;
				gap: 15px;
				margin-top: 20px;
			}
			
			.file-item {
				background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
				border-radius: 10px;
				padding: 20px;
				display: flex;
				align-items: center;
				gap: 20px;
				transition: all 0.3s ease;
			}
			
			.file-item:hover {
				transform: translateX(5px);
				box-shadow: 0 5px 20px rgba(0,0,0,0.1);
			}
			
			.file-icon {
				width: 50px;
				height: 50px;
				background: linear-gradient(135deg, #0066ff 0%, #00ccff 100%);
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-size: 24px;
			}
			
			.file-info {
				flex: 1;
			}
			
			.file-name {
				font-weight: 700;
				font-size: 16px;
				color: #1a1a1a;
				margin-bottom: 5px;
				font-family: 'Monaco', monospace;
			}
			
			.file-desc {
				color: #666;
				font-size: 14px;
			}
			
			.info-box {
				background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
				border-left: 4px solid #ffb700;
				padding: 20px;
				border-radius: 10px;
				margin: 20px 0;
			}
			
			.info-box strong {
				color: #856404;
			}
			
			.footer {
				background: #1a1a1a;
				color: white;
				text-align: center;
				padding: 30px;
				font-size: 14px;
			}
			
			.footer a {
				color: #0066ff;
				text-decoration: none;
			}
			
			@media (max-width: 768px) {
				.header h1 { font-size: 32px; }
				.content { padding: 20px; }
				.cards-grid { grid-template-columns: 1fr; }
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1><i class="fas fa-rocket"></i> EventFlex API</h1>
				<div class="status-badge">
					<span class="status-dot"></span>
					Backend Running Successfully
				</div>
				<p style="margin-top: 15px; font-size: 16px; opacity: 0.9;">Django 5.2.7 | Real-Time Event Staffing Platform</p>
			</div>
			
			<div class="content">
				<!-- Quick Links Section -->
				<div class="section">
					<h2 class="section-title"><i class="fas fa-link"></i> Quick Access</h2>
					<div class="cards-grid">
						<div class="card">
							<h3><i class="fas fa-shield-alt"></i> Admin Panel</h3>
							<p>Manage database, users, jobs, and applications</p>
							<a href="/admin/"><i class="fas fa-arrow-right"></i> Open Admin Panel</a>
							<div style="margin-top: 10px; padding: 8px; background: #fff3cd; border-radius: 6px; font-size: 13px;">
								<strong>Login:</strong> admin / admin123
							</div>
						</div>
						
						<div class="card">
							<h3><i class="fas fa-briefcase"></i> View Jobs</h3>
							<p>Browse all available event staffing opportunities</p>
							<a href="/api/jobs/"><i class="fas fa-arrow-right"></i> View All Jobs</a>
						</div>
						
						<div class="card">
							<h3><i class="fas fa-users"></i> View Talent</h3>
							<p>Browse verified event professionals</p>
							<a href="/api/talent/"><i class="fas fa-arrow-right"></i> View All Talent</a>
						</div>
					</div>
				</div>
				
				<!-- Frontend Pages Section -->
				<div class="section">
					<h2 class="section-title"><i class="fas fa-window-maximize"></i> Frontend Pages</h2>
					<div class="info-box">
						<strong><i class="fas fa-info-circle"></i> Note:</strong> Open these HTML files directly by double-clicking them in your file explorer
					</div>
					
					<div class="file-list">
						<div class="file-item">
							<div class="file-icon"><i class="fas fa-home"></i></div>
							<div class="file-info">
								<div class="file-name">index.html</div>
								<div class="file-desc">Landing page with hero section, features, and testimonials</div>
							</div>
						</div>
						
						<div class="file-item">
							<div class="file-icon"><i class="fas fa-sign-in-alt"></i></div>
							<div class="file-info">
								<div class="file-name">login.html</div>
								<div class="file-desc">Login page for organizers and event professionals</div>
							</div>
						</div>
						
						<div class="file-item">
							<div class="file-icon"><i class="fas fa-user-plus"></i></div>
							<div class="file-info">
								<div class="file-name">signup.html</div>
								<div class="file-desc">Registration page with user type selection</div>
							</div>
						</div>
						
						<div class="file-item">
							<div class="file-icon"><i class="fas fa-user-tie"></i></div>
							<div class="file-info">
								<div class="file-name">staff-portal.html</div>
								<div class="file-desc">Event Professional dashboard (find jobs, applications, wallet)</div>
							</div>
						</div>
						
						<div class="file-item">
							<div class="file-icon"><i class="fas fa-briefcase"></i></div>
							<div class="file-info">
								<div class="file-name">organizer-dashboard.html</div>
								<div class="file-desc">Organizer dashboard (post jobs, discover talent, manage applications)</div>
							</div>
						</div>
						
						<div class="file-item">
							<div class="file-icon"><i class="fas fa-book"></i></div>
							<div class="file-info">
								<div class="file-name">api-docs.html</div>
								<div class="file-desc">Interactive API documentation with live testing</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- API Endpoints Section -->
				<div class="section">
					<h2 class="section-title"><i class="fas fa-code"></i> API Endpoints</h2>
					
					<h3 style="margin: 25px 0 15px 0; color: #666; font-size: 18px;"><i class="fas fa-lock-open"></i> Public Endpoints</h3>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/jobs/</span>
						<span class="endpoint-desc">List all jobs</span>
					</div>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/jobs/&lt;id&gt;/</span>
						<span class="endpoint-desc">Get job details</span>
					</div>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/talent/</span>
						<span class="endpoint-desc">List event professionals</span>
					</div>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/jobs/&lt;id&gt;/apply/</span>
						<span class="endpoint-desc">Apply to a job</span>
					</div>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/auth/register/</span>
						<span class="endpoint-desc">Register new user</span>
					</div>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/auth/login/</span>
						<span class="endpoint-desc">Login user</span>
					</div>
					
					<h3 style="margin: 25px 0 15px 0; color: #666; font-size: 18px;"><i class="fas fa-lock"></i> Protected Endpoints (Auth Required)</h3>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/jobs/create/</span>
						<span class="endpoint-desc">Create new job (organizer only)</span>
					</div>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/jobs/my/</span>
						<span class="endpoint-desc">Get current user's jobs</span>
					</div>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/applications/</span>
						<span class="endpoint-desc">Get user's applications</span>
					</div>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/applications/&lt;id&gt;/status/</span>
						<span class="endpoint-desc">Update application status</span>
					</div>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/profiles/update/</span>
						<span class="endpoint-desc">Update user profile</span>
					</div>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/messages/</span>
						<span class="endpoint-desc">Get user messages</span>
					</div>
					
					<div class="endpoint">
						<span class="method post">POST</span>
						<span class="endpoint-path">/api/messages/send/</span>
						<span class="endpoint-desc">Send message</span>
					</div>
					
					<div class="endpoint">
						<span class="method get">GET</span>
						<span class="endpoint-path">/api/transactions/</span>
						<span class="endpoint-desc">Get transaction history</span>
					</div>
				</div>
				
				<!-- Documentation Section -->
				<div class="section">
					<h2 class="section-title"><i class="fas fa-book-open"></i> Documentation</h2>
					<div class="cards-grid">
						<div class="card">
							<h3><i class="fas fa-rocket"></i> Quick Start</h3>
							<p>Get started in 2 minutes with step-by-step guide</p>
							<p style="margin-top: 10px; font-family: monospace; font-size: 14px;">📄 QUICKSTART.md</p>
						</div>
						
						<div class="card">
							<h3><i class="fas fa-vial"></i> Testing Guide</h3>
							<p>Complete testing instructions with 20+ scenarios</p>
							<p style="margin-top: 10px; font-family: monospace; font-size: 14px;">📄 TESTING.md</p>
						</div>
						
						<div class="card">
							<h3><i class="fas fa-cog"></i> Implementation</h3>
							<p>Technical details and architecture overview</p>
							<p style="margin-top: 10px; font-family: monospace; font-size: 14px;">📄 IMPLEMENTATION.md</p>
						</div>
						
						<div class="card">
							<h3><i class="fas fa-file-alt"></i> README</h3>
							<p>Complete project documentation and setup guide</p>
							<p style="margin-top: 10px; font-family: monospace; font-size: 14px;">📄 README.md</p>
						</div>
					</div>
				</div>
			</div>
			
			<div class="footer">
				<p><strong>EventFlex</strong> - On-Demand Platform for Event Staffing</p>
				<p style="margin-top: 10px; opacity: 0.7;">Built with Django 5.2.7 & Vanilla JavaScript | Full-Stack Real-Time Integration</p>
			</div>
		</div>
	</body>
	</html>
	"""
	return HttpResponse(html)


def _profile_to_dict(profile: UserProfile):
	return {
		'id': profile.id,
		'username': profile.user.username,
		'email': profile.user.email,
		'first_name': profile.user.first_name,
		'last_name': profile.user.last_name,
		'user_type': profile.user_type,
		'city': profile.city,
		'phone': profile.phone,
		'bio': profile.bio,
		'kyc_verified': profile.kyc_verified,
		'video_verified': profile.video_verified,
		'badge': profile.badge,
	}


def _job_to_dict(job: Job):
	return {
		'id': job.id,
		'title': job.title,
		'role': job.role,
		'event_type': job.event_type,
		'number_of_staff': job.number_of_staff,
		'skills': job.skills,
		'date': safe_isoformat(job.date),
		'start_time': safe_isoformat(job.start_time),
		'end_time': safe_isoformat(job.end_time),
		'location': job.location,
		'pay_rate': str(job.pay_rate),
		'payment_type': job.payment_type,
		'description': job.description,
		'requirements': job.requirements,
		'organizer': _profile_to_dict(job.organizer),
	}


def _application_to_dict(application):
	"""Convert Application model to dictionary with all details"""
	return {
		'id': application.id,
		'job': {
			'id': application.job.id,
			'title': application.job.title,
			'role': application.job.role,
			'location': application.job.location,
			'date': safe_isoformat(application.job.date),
			'pay_rate': str(application.job.pay_rate),
		},
		'applicant': _profile_to_dict(application.applicant),
		'status': application.status,
		'created_at': safe_isoformat(application.created_at),
		'cover_message': application.cover_message,
		'full_name': application.full_name,
		'email': application.email,
		'phone': application.phone,
		'experience_years': application.experience_years,
		'relevant_skills': application.relevant_skills,
		'availability': application.availability,
		'portfolio_link': application.portfolio_link,
		'previous_events': application.previous_events,
		'why_interested': application.why_interested,
		'expected_compensation': str(application.expected_compensation) if application.expected_compensation else None,
	}


def jobs_list(request):
	jobs = Job.objects.all().order_by('-created_at')[:50]
	data = [_job_to_dict(j) for j in jobs]
	return JsonResponse({'results': data})


def job_detail(request, job_id):
	job = get_object_or_404(Job, id=job_id)
	return JsonResponse(_job_to_dict(job))


@csrf_exempt
def apply_job(request, job_id):
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)

	job = get_object_or_404(Job, id=job_id)
	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		payload = {}

	# For prototype, allow application by username
	username = payload.get('username')
	cover = payload.get('cover_message', '')
	if not username:
		return JsonResponse({'error': 'username required in payload'}, status=400)

	try:
		user = User.objects.get(username=username)
		profile = UserProfile.objects.get(user=user)
	except User.DoesNotExist:
		return JsonResponse({'error': 'user not found'}, status=404)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'user profile not found'}, status=404)

	# Check if user has already applied to this job
	existing_application = Application.objects.filter(job=job, applicant=profile).first()
	if existing_application:
		return JsonResponse({
			'error': 'You have already applied to this job',
			'already_applied': True,
			'application_id': existing_application.id
		}, status=400)

	# Create application with detailed form fields
	app = Application.objects.create(
		job=job,
		applicant=profile,
		cover_message=payload.get('cover_message', cover),
		full_name=payload.get('full_name', ''),
		email=payload.get('email', ''),
		phone=payload.get('phone', ''),
		experience_years=payload.get('experience_years', '0'),
		relevant_skills=payload.get('relevant_skills', ''),
		availability=payload.get('availability', ''),
		portfolio_link=payload.get('portfolio_link', ''),
		previous_events=payload.get('previous_events', ''),
		why_interested=payload.get('why_interested', ''),
		expected_compensation=payload.get('expected_compensation', '')
	)
	return JsonResponse({
		'message': 'Application submitted successfully',
		'application_id': app.id,
		'status': app.status
	})


def talent_list(request):
	profiles = UserProfile.objects.filter(user_type='staff')[:50]
	data = [_profile_to_dict(p) for p in profiles]
	return JsonResponse({'results': data})


def profile_detail(request, pk):
	profile = get_object_or_404(UserProfile, id=pk)
	return JsonResponse(_profile_to_dict(profile))


@csrf_exempt
def register_view(request):
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)

	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		payload = {}

	username = payload.get('username')
	email = payload.get('email')
	password = payload.get('password')
	user_type = payload.get('user_type', 'staff')

	if not username or not password:
		return JsonResponse({'error': 'username and password required'}, status=400)

	if User.objects.filter(username=username).exists():
		return JsonResponse({'error': 'username taken'}, status=400)

	user = User.objects.create_user(username=username, email=email, password=password)
	profile = UserProfile.objects.create(user=user, user_type=user_type, city=payload.get('city', ''))
	return JsonResponse({'message': 'registered', 'user': {'username': user.username, 'id': profile.id}})


@csrf_exempt
@csrf_exempt
def login_view(request):
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)

	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		payload = {}

	username = payload.get('username')
	password = payload.get('password')
	
	# Try to authenticate with username first
	user = authenticate(request, username=username, password=password)
	
	# If authentication fails and input looks like an email, try to find user by email
	if user is None and '@' in username:
		try:
			user_obj = User.objects.get(email=username)
			user = authenticate(request, username=user_obj.username, password=password)
		except User.DoesNotExist:
			pass
	
	if user is None:
		return JsonResponse({'error': 'invalid credentials'}, status=401)

	login(request, user)
	try:
		profile = UserProfile.objects.get(user=user)
		return JsonResponse({'message': 'logged in', 'profile': _profile_to_dict(profile)})
	except UserProfile.DoesNotExist:
		return JsonResponse({'message': 'logged in', 'username': user.username})


def logout_view(request):
	logout(request)
	return JsonResponse({'message': 'logged out'})


@csrf_exempt
def create_job(request):
	"""Create a new job posting (organizer only)"""
	try:
		print(f"DEBUG: create_job called - Method: {request.method}")
		print(f"DEBUG: User authenticated: {request.user.is_authenticated}")
		print(f"DEBUG: User: {request.user}")
		
		if request.method != 'POST':
			return JsonResponse({'error': 'POST required'}, status=400)
		
		if not request.user.is_authenticated:
			return JsonResponse({'error': 'authentication required'}, status=401)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			print(f"DEBUG: Profile found: {profile.user.username}, type: {profile.user_type}")
			if profile.user_type != 'organizer':
				return JsonResponse({'error': 'only organizers can post jobs'}, status=403)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'profile not found'}, status=404)
		
		try:
			payload = json.loads(request.body.decode('utf-8'))
			print(f"DEBUG: Payload received: {payload}")
		except Exception as e:
			print(f"DEBUG: JSON parse error: {e}")
			return JsonResponse({'error': f'invalid JSON: {str(e)}'}, status=400)
		
		# Create job
		try:
			job = Job.objects.create(
				organizer=profile,
				title=payload.get('title', ''),
				role=payload.get('role', ''),
				event_type=payload.get('event_type', ''),
				number_of_staff=int(payload.get('number_of_staff', 1)) if payload.get('number_of_staff') else 1,
				skills=payload.get('skills', ''),
				date=payload.get('date'),
				start_time=payload.get('start_time'),
				end_time=payload.get('end_time'),
				location=payload.get('location', ''),
				pay_rate=payload.get('pay_rate', '0'),
				payment_type=payload.get('payment_type', 'daily'),
				description=payload.get('description', ''),
				requirements=payload.get('requirements', '')
			)
			
			# Save autocomplete suggestions
			if job.event_type:
				suggestion, created = AutocompleteSuggestion.objects.get_or_create(
					field_type='event_type',
					value=job.event_type,
					defaults={'created_by': profile}
				)
				if not created:
					suggestion.usage_count += 1
					suggestion.save()
					
			if job.role:
				suggestion, created = AutocompleteSuggestion.objects.get_or_create(
					field_type='role',
					value=job.role,
					defaults={'created_by': profile}
				)
				if not created:
					suggestion.usage_count += 1
					suggestion.save()
					
			if job.location:
				suggestion, created = AutocompleteSuggestion.objects.get_or_create(
					field_type='location',
					value=job.location,
					defaults={'created_by': profile}
				)
				if not created:
					suggestion.usage_count += 1
					suggestion.save()
					
			if job.skills:
				suggestion, created = AutocompleteSuggestion.objects.get_or_create(
					field_type='skills',
					value=job.skills,
					defaults={'created_by': profile}
				)
				if not created:
					suggestion.usage_count += 1
					suggestion.save()

			
			print(f"DEBUG: Job created successfully: {job.id}")
			return JsonResponse({'message': 'job created', 'job': _job_to_dict(job)})
		except Exception as e:
			print(f"DEBUG: Job creation error: {type(e).__name__}: {e}")
			import traceback
			traceback.print_exc()
			return JsonResponse({'error': f'Failed to create job: {str(e)}'}, status=500)
	except Exception as e:
		print(f"DEBUG: Unexpected error in create_job: {type(e).__name__}: {e}")
		import traceback
		traceback.print_exc()
		return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def my_jobs(request):
	"""Get jobs posted by current organizer"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	jobs = Job.objects.filter(organizer=profile).order_by('-created_at')
	data = [_job_to_dict(j) for j in jobs]
	return JsonResponse({'results': data})


def my_applications(request):
	"""Get applications for current user (staff: their applications, organizer: applications to their jobs)"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	if profile.user_type == 'staff':
		# Get applications submitted by this staff member
		applications = Application.objects.filter(applicant=profile).order_by('-created_at')
	else:
		# Get applications to jobs posted by this organizer
		applications = Application.objects.filter(job__organizer=profile).order_by('-created_at')
	
	data = [_application_to_dict(app) for app in applications]
	
	return JsonResponse({'results': data})


@csrf_exempt
def update_application_status(request, app_id):
	"""Update application status (organizer only)"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		if profile.user_type != 'organizer':
			return JsonResponse({'error': 'only organizers can update status'}, status=403)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	app = get_object_or_404(Application, id=app_id)
	
	# Verify organizer owns this job
	if app.job.organizer != profile:
		return JsonResponse({'error': 'unauthorized'}, status=403)
	
	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		return JsonResponse({'error': 'invalid JSON'}, status=400)
	
	status = payload.get('status')
	if status not in ['pending', 'accepted', 'rejected']:
		return JsonResponse({'error': 'invalid status'}, status=400)
	
	app.status = status
	app.save()
	
	return JsonResponse({'message': 'status updated', 'application_id': app.id, 'status': status})


def get_application_detail(request, app_id):
	"""Get detailed information about a single application"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	app = get_object_or_404(Application, id=app_id)
	
	# Verify user has permission to view this application
	if profile.user_type == 'organizer':
		if app.job.organizer != profile:
			return JsonResponse({'error': 'unauthorized'}, status=403)
	elif profile.user_type == 'staff':
		if app.applicant != profile:
			return JsonResponse({'error': 'unauthorized'}, status=403)
	
	return JsonResponse(_application_to_dict(app))


@csrf_exempt
def accept_application(request, app_id):
	"""Accept an application (organizer only)"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		if profile.user_type != 'organizer':
			return JsonResponse({'error': 'only organizers can accept applications'}, status=403)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	app = get_object_or_404(Application, id=app_id)
	
	# Verify organizer owns this job
	if app.job.organizer != profile:
		return JsonResponse({'error': 'unauthorized'}, status=403)
	
	app.status = 'accepted'
	app.save()
	
	return JsonResponse({
		'message': 'Application accepted successfully',
		'application_id': app.id,
		'status': 'accepted',
		'applicant_name': app.full_name or app.applicant.user.username
	})


@csrf_exempt
def reject_application(request, app_id):
	"""Reject an application (organizer only)"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		if profile.user_type != 'organizer':
			return JsonResponse({'error': 'only organizers can reject applications'}, status=403)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	app = get_object_or_404(Application, id=app_id)
	
	# Verify organizer owns this job
	if app.job.organizer != profile:
		return JsonResponse({'error': 'unauthorized'}, status=403)
	
	app.status = 'rejected'
	app.save()
	
	return JsonResponse({
		'message': 'Application rejected',
		'application_id': app.id,
		'status': 'rejected'
	})


@csrf_exempt
def update_profile(request):
	"""Update current user's profile"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		return JsonResponse({'error': 'invalid JSON'}, status=400)
	
	# Update allowed fields
	if 'phone' in payload:
		profile.phone = payload['phone']
	if 'bio' in payload:
		profile.bio = payload['bio']
	if 'city' in payload:
		profile.city = payload['city']
	
	profile.save()
	
	return JsonResponse({'message': 'profile updated', 'profile': _profile_to_dict(profile)})


def my_messages(request):
	"""Get messages for current user"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	# Get conversation partner ID if provided
	partner_id = request.GET.get('partner_id')
	
	if partner_id:
		# Get messages for specific conversation
		messages = Message.objects.filter(
			sender=profile, recipient_id=partner_id
		) | Message.objects.filter(
			sender_id=partner_id, recipient=profile
		)
		messages = messages.order_by('created_at')
	else:
		# Get all messages
		messages = Message.objects.filter(
			sender=profile
		) | Message.objects.filter(
			recipient=profile
		)
		messages = messages.order_by('-created_at')[:100]
	
	data = []
	for msg in messages:
		data.append({
			'id': msg.id,
			'sender': _profile_to_dict(msg.sender),
			'recipient': _profile_to_dict(msg.recipient),
			'text': msg.text,
			'created_at': msg.created_at.isoformat()
		})
	
	return JsonResponse({'results': data})


@csrf_exempt
def send_message(request):
	"""Send a message to another user"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		sender_profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		return JsonResponse({'error': 'invalid JSON'}, status=400)
	
	recipient_id = payload.get('recipient_id')
	text = payload.get('text', '').strip()
	
	if not recipient_id or not text:
		return JsonResponse({'error': 'recipient_id and text required'}, status=400)
	
	try:
		recipient_profile = UserProfile.objects.get(id=recipient_id)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'recipient not found'}, status=404)
	
	message = Message.objects.create(
		sender=sender_profile,
		recipient=recipient_profile,
		text=text
	)
	
	return JsonResponse({
		'message': 'sent',
		'id': message.id,
		'created_at': message.created_at.isoformat()
	})


def my_transactions(request):
	"""Get transactions for current user"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	transactions = Transaction.objects.filter(user=profile).select_related('application__job__organizer__user').order_by('-created_at')[:50]
	
	data = []
	for txn in transactions:
		event_title = ''
		organizer_name = ''
		event_date = None
		
		if txn.application and txn.application.job:
			job = txn.application.job
			event_title = job.title
			organizer_name = job.organizer.user.username if job.organizer else 'Unknown'
			event_date = safe_isoformat(job.date)
		
		data.append({
			'id': txn.id,
			'amount': str(txn.amount),
			'status': txn.status,
			'note': txn.note,
			'event_title': event_title,
			'organizer_name': organizer_name,
			'event_date': event_date,
			'created_at': txn.created_at.isoformat()
		})
	
	return JsonResponse({'results': data})


def wallet_stats(request):
	"""Get wallet statistics for current user"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	from django.db.models import Sum, Count
	from decimal import Decimal
	
	# Calculate available balance (completed transactions)
	completed_txns = Transaction.objects.filter(user=profile, status='completed')
	available_balance = completed_txns.aggregate(total=Sum('amount'))['total'] or Decimal('0')
	
	# Calculate pending payments
	pending_txns = Transaction.objects.filter(user=profile, status='pending')
	pending_amount = pending_txns.aggregate(total=Sum('amount'))['total'] or Decimal('0')
	pending_count = pending_txns.count()
	
	# Calculate total earned (all completed transactions)
	total_earned = available_balance
	total_events = completed_txns.values('application').distinct().count()
	
	# Get monthly earnings for chart (last 6 months)
	from datetime import datetime, timedelta
	from django.db.models.functions import TruncMonth
	
	six_months_ago = datetime.now() - timedelta(days=180)
	monthly_data = Transaction.objects.filter(
		user=profile,
		status='completed',
		created_at__gte=six_months_ago
	).annotate(
		month=TruncMonth('created_at')
	).values('month').annotate(
		total=Sum('amount')
	).order_by('month')
	
	monthly_earnings = []
	for item in monthly_data:
		monthly_earnings.append({
			'month': item['month'].strftime('%b'),
			'amount': str(item['total'])
		})
	
	return JsonResponse({
		'available_balance': str(available_balance),
		'pending_amount': str(pending_amount),
		'pending_count': pending_count,
		'total_earned': str(total_earned),
		'total_events': total_events,
		'monthly_earnings': monthly_earnings
	})


@csrf_exempt
def withdraw_funds(request):
	"""Withdraw funds to bank account"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	try:
		data = json.loads(request.body)
		amount = Decimal(str(data.get('amount', 0)))
		
		if amount <= 0:
			return JsonResponse({'error': 'Invalid amount'}, status=400)
		
		# Check available balance
		from django.db.models import Sum
		completed_txns = Transaction.objects.filter(user=profile, status='completed')
		available_balance = completed_txns.aggregate(total=Sum('amount'))['total'] or Decimal('0')
		
		if amount > available_balance:
			return JsonResponse({'error': 'Insufficient balance'}, status=400)
		
		# Create withdrawal transaction (negative amount)
		Transaction.objects.create(
			user=profile,
			amount=-amount,
			status='completed',
			note=f'Withdrawal to bank account'
		)
		
		return JsonResponse({
			'success': True,
			'message': f'₹{amount} withdrawn successfully',
			'new_balance': str(available_balance - amount)
		})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def upload_profile_photo(request):
	"""Upload profile photo"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		
		# In a real implementation, you would save the file
		# For now, we'll simulate it
		if 'photo' in request.FILES:
			# photo = request.FILES['photo']
			# Save photo logic here
			return JsonResponse({
				'success': True,
				'message': 'Profile photo updated successfully',
				'photo_url': 'https://ui-avatars.com/api/?name=' + request.user.username
			})
		else:
			return JsonResponse({'error': 'No photo provided'}, status=400)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)


@csrf_exempt
def upload_video_intro(request):
	"""Upload video introduction"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		
		# Mark video as verified after upload
		profile.video_verified = True
		profile.save()
		
		return JsonResponse({
			'success': True,
			'message': 'Video introduction uploaded successfully',
			'video_verified': True
		})
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)


@csrf_exempt
def send_message_api(request):
	"""Send a message to another user"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		sender_profile = UserProfile.objects.get(user=request.user)
		data = json.loads(request.body)
		
		recipient_id = data.get('recipient_id')
		message_text = data.get('message', '').strip()
		
		if not message_text:
			return JsonResponse({'error': 'Message cannot be empty'}, status=400)
		
		recipient_profile = UserProfile.objects.get(id=recipient_id)
		
		message = Message.objects.create(
			sender=sender_profile,
			recipient=recipient_profile,
			text=message_text
		)
		
		return JsonResponse({
			'success': True,
			'message': 'Message sent successfully',
			'message_id': message.id,
			'created_at': message.created_at.isoformat()
		})
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'User not found'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


def track_attendance(request, job_id):
	"""Generate QR code for attendance tracking"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		job = Job.objects.get(id=job_id, organizer=profile)
		
		# Generate attendance tracking data
		attendance_data = {
			'job_id': job.id,
			'job_title': job.title,
			'date': safe_isoformat(job.date),
			'location': job.location,
			'tracking_code': f'ATT-{job.id}-{datetime.now().strftime("%Y%m%d")}'
		}
		
		return JsonResponse({
			'success': True,
			'attendance_data': attendance_data
		})
	except Job.DoesNotExist:
		return JsonResponse({'error': 'Job not found'}, status=404)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)


def download_report(request, job_id):
	"""Generate and download job report"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		job = Job.objects.get(id=job_id, organizer=profile)
		
		# Get job applications
		applications = Application.objects.filter(job=job)
		
		report_data = {
			'job_title': job.title,
			'event_date': safe_isoformat(job.date),
			'location': job.location,
			'total_applications': applications.count(),
			'accepted': applications.filter(status='accepted').count(),
			'pending': applications.filter(status='pending').count(),
			'rejected': applications.filter(status='rejected').count(),
			'total_cost': str(job.pay_rate * applications.filter(status='accepted').count())
		}
		
		return JsonResponse({
			'success': True,
			'report': report_data
		})
	except Job.DoesNotExist:
		return JsonResponse({'error': 'Job not found'}, status=404)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)


@csrf_exempt
def add_funds(request):
	"""Add funds to organizer wallet"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		data = json.loads(request.body)
		
		amount = Decimal(str(data.get('amount', 0)))
		
		if amount <= 0:
			return JsonResponse({'error': 'Invalid amount'}, status=400)
		
		# Create transaction for funds added
		Transaction.objects.create(
			user=profile,
			amount=amount,
			status='completed',
			note='Funds added to wallet'
		)
		
		return JsonResponse({
			'success': True,
			'message': f'₹{amount} added successfully'
		})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def release_payment(request, application_id):
	"""Release payment to staff member"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		organizer_profile = UserProfile.objects.get(user=request.user)
		application = Application.objects.get(id=application_id, job__organizer=organizer_profile)
		
		if application.status != 'accepted':
			return JsonResponse({'error': 'Can only release payment for accepted applications'}, status=400)
		
		# Check if payment already exists
		existing_payment = Transaction.objects.filter(
			application=application,
			user=application.applicant,
			status='completed'
		).exists()
		
		if existing_payment:
			return JsonResponse({'error': 'Payment already released'}, status=400)
		
		# Create transaction for staff member
		Transaction.objects.create(
			user=application.applicant,
			application=application,
			amount=application.job.pay_rate,
			status='completed',
			note=f'Payment for {application.job.title}'
		)
		
		return JsonResponse({
			'success': True,
			'message': f'Payment of ₹{application.job.pay_rate} released successfully'
		})
	except Application.DoesNotExist:
		return JsonResponse({'error': 'Application not found'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def save_profile(request):
	"""Save profile changes"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
		data = json.loads(request.body)
		
		# Update user fields
		if 'first_name' in data:
			request.user.first_name = data['first_name']
		if 'last_name' in data:
			request.user.last_name = data['last_name']
		if 'email' in data:
			request.user.email = data['email']
		request.user.save()
		
		# Update profile fields
		if 'phone' in data:
			profile.phone = data['phone']
		if 'city' in data:
			profile.city = data['city']
		if 'bio' in data:
			profile.bio = data['bio']
		profile.save()
		
		return JsonResponse({
			'success': True,
			'message': 'Profile updated successfully'
		})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def get_autocomplete_suggestions(request):
	"""Get autocomplete suggestions for a specific field"""
	if request.method != 'GET':
		return JsonResponse({'error': 'GET required'}, status=405)
	
	field_type = request.GET.get('field_type', '')
	query = request.GET.get('query', '').strip()
	
	if not field_type:
		return JsonResponse({'error': 'field_type required'}, status=400)
	
	try:
		# Get suggestions filtered by field_type
		suggestions = AutocompleteSuggestion.objects.filter(field_type=field_type)
		
		# If query provided, filter by value containing query
		if query:
			suggestions = suggestions.filter(value__icontains=query)
		
		# Limit to top 10 suggestions
		suggestions = suggestions[:10]
		
		data = [{'value': s.value, 'usage_count': s.usage_count} for s in suggestions]
		
		return JsonResponse({'suggestions': data})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def save_autocomplete_suggestion(request):
	"""Save or update autocomplete suggestion"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=405)
	
	try:
		data = json.loads(request.body)
		field_type = data.get('field_type', '')
		value = data.get('value', '').strip()
		
		if not field_type or not value:
			return JsonResponse({'error': 'field_type and value required'}, status=400)
		
		# Get user profile if authenticated
		user_profile = None
		if request.user.is_authenticated:
			user_profile = UserProfile.objects.get(user=request.user)
		
		# Get or create suggestion
		suggestion, created = AutocompleteSuggestion.objects.get_or_create(
			field_type=field_type,
			value=value,
			defaults={'created_by': user_profile}
		)
		
		# If already exists, increment usage count
		if not created:
			suggestion.usage_count += 1
			suggestion.save()
		
		return JsonResponse({
			'success': True,
			'created': created,
			'usage_count': suggestion.usage_count
		})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)
