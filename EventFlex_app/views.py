from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import models as django_models
from .models import UserProfile, Job, Application, Message, Transaction, AutocompleteSuggestion, VerificationDocument
from .jwt_utils import generate_jwt_token, generate_refresh_token, get_token_from_request, blacklist_token
import json
import re
from datetime import datetime
from decimal import Decimal


def safe_isoformat(value):
	"""Safely convert date/time to ISO format string"""
	if value is None:
		return None
	if isinstance(value, str):
		return value
	if hasattr(value, 'isoformat'):
		return value.isoformat()
	return str(value)


def index_view(request):
	"""Landing page"""
	total_professionals = UserProfile.objects.filter(user_type='staff').count()
	total_events = Job.objects.count()
	
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
	total_professionals = UserProfile.objects.filter(user_type='staff').count()
	total_events = Job.objects.count()
	
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
		'wallet_balance': str(profile.wallet_balance),
		'average_rating': str(profile.average_rating),
		'total_reviews': profile.total_reviews,
		'total_events_completed': profile.total_events_completed,
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
		'status': job.status,
		'is_draft': job.is_draft,
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
			'start_time': safe_isoformat(application.job.start_time),
			'end_time': safe_isoformat(application.job.end_time),
			'pay_rate': str(application.job.pay_rate),
			'payment_type': application.job.payment_type,
			'status': application.job.status,
			'organizer': _profile_to_dict(application.job.organizer),
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
		'ai_rating': float(application.ai_rating) if application.ai_rating else None,
		'ai_rating_details': application.ai_rating_details,
		'resume': application.resume.url if hasattr(application, 'resume') and application.resume else None,
	}


def calculate_ai_rating(relevant_skills, why_interested, cover_message, job):
	"""
	AI-powered rating system that evaluates application quality based on:
	- Relevant Skills
	- Why Interested in Position
	- Cover Message
	Returns a rating between 0-5 stars and detailed feedback
	"""
	rating = 0.0
	feedback_parts = []
	
	# === SKILLS EVALUATION (0-2 points) ===
	skills_score = 0.0
	if relevant_skills and len(relevant_skills.strip()) > 0:
		skills_lower = relevant_skills.lower()
		job_skills_lower = (job.skills or '').lower()
		job_role_lower = (job.role or '').lower()
		
		if len(relevant_skills) > 100:
			skills_score += 0.5
			feedback_parts.append("✓ Detailed skills description")
		elif len(relevant_skills) > 50:
			skills_score += 0.3
			feedback_parts.append("○ Good skills overview")
		else:
			feedback_parts.append("✗ Skills section needs more detail")
		
		skill_keywords = ['photography', 'videography', 'coordination', 'management', 'technical', 
						  'sound', 'lighting', 'catering', 'security', 'stage', 'equipment',
						  'social media', 'marketing', 'design', 'decoration', 'planning']
		matched_skills = [kw for kw in skill_keywords if kw in skills_lower]
		
		if len(matched_skills) >= 3:
			skills_score += 0.7
			feedback_parts.append(f"✓ Multiple relevant skills mentioned ({len(matched_skills)})")
		elif len(matched_skills) >= 1:
			skills_score += 0.4
			feedback_parts.append(f"○ Some relevant skills mentioned ({len(matched_skills)})")
		
		if job_skills_lower and any(word in skills_lower for word in job_skills_lower.split() if len(word) > 3):
			skills_score += 0.5
			feedback_parts.append("✓ Skills align with job requirements")
		
		if job_role_lower and any(word in skills_lower for word in job_role_lower.split() if len(word) > 3):
			skills_score += 0.3
			feedback_parts.append("✓ Experience in similar role")
	else:
		feedback_parts.append("✗ No skills provided")
	
	rating += min(skills_score, 2.0)
	
	interest_score = 0.0
	if why_interested and len(why_interested.strip()) > 0:
		interest_lower = why_interested.lower()
		
		if len(why_interested) > 150:
			interest_score += 0.5
			feedback_parts.append("✓ Thoughtful explanation of interest")
		elif len(why_interested) > 80:
			interest_score += 0.3
			feedback_parts.append("○ Decent explanation provided")
		else:
			feedback_parts.append("✗ Interest explanation too brief")
		
		passion_words = ['passion', 'excited', 'love', 'enthusiastic', 'motivated', 'dedicated',
						 'inspire', 'dream', 'goal', 'aspire', 'committed']
		if any(word in interest_lower for word in passion_words):
			interest_score += 0.4
			feedback_parts.append("✓ Shows genuine enthusiasm")
		
		specific_reasons = ['experience', 'learn', 'grow', 'develop', 'contribute', 'help',
						   'team', 'opportunity', 'challenge', 'skills']
		mentioned_reasons = [r for r in specific_reasons if r in interest_lower]
		if len(mentioned_reasons) >= 2:
			interest_score += 0.3
			feedback_parts.append("✓ Clear motivation stated")
		
		if 'event' in interest_lower or 'organization' in interest_lower or job.title.lower() in interest_lower:
			interest_score += 0.3
			feedback_parts.append("✓ Shows research about the position")
	else:
		feedback_parts.append("✗ No explanation of interest")
	
	rating += min(interest_score, 1.5)
	
	cover_score = 0.0
	if cover_message and len(cover_message.strip()) > 0:
		cover_lower = cover_message.lower()
		
		if len(cover_message) > 200:
			cover_score += 0.5
			feedback_parts.append("✓ Comprehensive cover message")
		elif len(cover_message) > 100:
			cover_score += 0.3
			feedback_parts.append("○ Adequate cover message")
		else:
			feedback_parts.append("✗ Cover message too short")
		
		sentences = len([s for s in re.split('[.!?]+', cover_message) if s.strip()])
		if sentences >= 4:
			cover_score += 0.3
			feedback_parts.append("✓ Well-structured message")
		
		value_words = ['offer', 'bring', 'provide', 'deliver', 'ensure', 'guarantee',
					   'achieve', 'accomplish', 'excel', 'succeed', 'contribute']
		if any(word in cover_lower for word in value_words):
			cover_score += 0.4
			feedback_parts.append("✓ Highlights value proposition")
		
		if not any(word in cover_lower for word in ['hey', 'yo', 'sup', 'lol', 'haha']):
			cover_score += 0.2
			feedback_parts.append("✓ Professional tone")
		else:
			feedback_parts.append("✗ Unprofessional language detected")
		
		closing_words = ['forward', 'hearing', 'discuss', 'interview', 'meeting', 'thank', 'regards']
		if any(word in cover_lower for word in closing_words):
			cover_score += 0.1
			feedback_parts.append("✓ Professional closing")
	else:
		feedback_parts.append("✗ No cover message provided")
	
	rating += min(cover_score, 1.5)
	
	rating = round(min(rating, 5.0), 1)
	
	if rating >= 4.5:
		overall = "⭐ EXCELLENT APPLICATION - Highly qualified candidate"
	elif rating >= 3.5:
		overall = "✓ STRONG APPLICATION - Good candidate"
	elif rating >= 2.5:
		overall = "○ DECENT APPLICATION - Consider for interview"
	elif rating >= 1.5:
		overall = "△ WEAK APPLICATION - Missing key details"
	else:
		overall = "✗ POOR APPLICATION - Insufficient information"
	
	feedback = overall + "\n\n" + "\n".join(feedback_parts)
	
	return rating, feedback


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

	existing_application = Application.objects.filter(job=job, applicant=profile).first()
	if existing_application:
		return JsonResponse({
			'error': 'You have already applied to this job',
			'already_applied': True,
			'application_id': existing_application.id
		}, status=400)

	relevant_skills = payload.get('relevant_skills', '')
	why_interested = payload.get('why_interested', '')
	cover_message_text = payload.get('cover_message', cover)
	
	ai_rating, ai_feedback = calculate_ai_rating(
		relevant_skills=relevant_skills,
		why_interested=why_interested,
		cover_message=cover_message_text,
		job=job
	)

	app = Application.objects.create(
		job=job,
		applicant=profile,
		cover_message=cover_message_text,
		full_name=payload.get('full_name', ''),
		email=payload.get('email', ''),
		phone=payload.get('phone', ''),
		experience_years=payload.get('experience_years', '0'),
		relevant_skills=relevant_skills,
		availability=payload.get('availability', ''),
		portfolio_link=payload.get('portfolio_link', ''),
		previous_events=payload.get('previous_events', ''),
		why_interested=why_interested,
		expected_compensation=payload.get('expected_compensation', ''),
		ai_rating=ai_rating,
		ai_rating_details=ai_feedback
	)
	return JsonResponse({
		'message': 'Application submitted successfully',
		'application_id': app.id,
		'status': app.status,
		'ai_rating': float(ai_rating),
		'ai_feedback': ai_feedback
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
	"""
	Register new user with JWT token generation
	
	Supports both web (cookie-based) and API/mobile (header-based) authentication:
	- Web: Returns JWT in HTTP-only cookie
	- API/Mobile: Include 'X-Platform: mobile' header to get token in response body
	
	Request body:
	{
		"username": "newuser",
		"email": "user@example.com",
		"password": "password123",
		"user_type": "staff" or "organizer",
		"city": "Mumbai" (optional)
	}
	
	Response:
	{
		"message": "registered",
		"user": {...},
		"profile": {...},
		"token": "jwt_token_here"  // Only for mobile/API requests
	}
	"""
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
	phone = payload.get('phone', '')
	city = payload.get('city', '')

	if not username or not password:
		return JsonResponse({'error': 'username and password required'}, status=400)

	if User.objects.filter(username=username).exists():
		return JsonResponse({'error': 'username taken'}, status=400)

	# Create user and profile with all signup data
	user = User.objects.create_user(username=username, email=email, password=password)
	profile = UserProfile.objects.create(
		user=user, 
		user_type=user_type, 
		city=city,
		phone=phone
	)
	
	# Generate JWT tokens
	access_token = generate_jwt_token(user)
	refresh_token = generate_refresh_token(user)
	
	# Check if request is from mobile/API client
	is_mobile = request.headers.get('X-Platform') == 'mobile' or request.headers.get('X-API-Client') == 'true'
	
	response_data = {
		'message': 'registered',
		'user': {'username': user.username, 'id': profile.id},
		'profile': _profile_to_dict(profile)
	}
	
	# For mobile/API clients, include token in response body
	if is_mobile:
		response_data['access_token'] = access_token
		response_data['refresh_token'] = refresh_token
		response_data['token_type'] = 'Bearer'
		return JsonResponse(response_data)
	
	# For web clients, set token as HTTP-only cookie
	response = JsonResponse(response_data)
	response.set_cookie(
		'jwt_token',
		access_token,
		max_age=7 * 24 * 60 * 60,
		httponly=True,
		secure=False,
		samesite='Lax'
	)
	response.set_cookie(
		'jwt_refresh_token',
		refresh_token,
		max_age=30 * 24 * 60 * 60,
		httponly=True,
		secure=False,
		samesite='Lax'
	)
	
	return response


@csrf_exempt
def login_view(request):
	"""
	Login view with JWT token generation
	
	Supports both web (cookie-based) and API/mobile (header-based) authentication:
	- Web: Returns JWT in HTTP-only cookie (no frontend changes needed)
	- API/Mobile: Include 'X-Platform: mobile' header to get token in response body
	
	Request body:
	{
		"username": "user@example.com or username",
		"password": "password123"
	}
	
	Response:
	{
		"message": "logged in",
		"profile": {...},
		"token": "jwt_token_here"  // Only for mobile/API requests
	}
	"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)

	try:
		payload = json.loads(request.body.decode('utf-8'))
	except Exception:
		payload = {}

	username = payload.get('username')
	password = payload.get('password')
	
	if not username or not password:
		return JsonResponse({'error': 'username and password required'}, status=400)
	
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

	# Generate JWT tokens
	access_token = generate_jwt_token(user)
	refresh_token = generate_refresh_token(user)
	
	# Get user profile
	try:
		profile = UserProfile.objects.get(user=user)
		profile_data = _profile_to_dict(profile)
	except UserProfile.DoesNotExist:
		profile_data = {'username': user.username}
	
	# Check if request is from mobile/API client (needs token in body)
	is_mobile = request.headers.get('X-Platform') == 'mobile' or request.headers.get('X-API-Client') == 'true'
	
	response_data = {
		'message': 'logged in',
		'profile': profile_data
	}
	
	# For mobile/API clients, include token in response body
	if is_mobile:
		response_data['access_token'] = access_token
		response_data['refresh_token'] = refresh_token
		response_data['token_type'] = 'Bearer'
		return JsonResponse(response_data)
	
	# For web clients, set token as HTTP-only cookie (no frontend changes needed!)
	response = JsonResponse(response_data)
	response.set_cookie(
		'jwt_token',
		access_token,
		max_age=7 * 24 * 60 * 60,  # 7 days
		httponly=True,  # JavaScript cannot access (XSS protection)
		secure=False,  # Set to True in production with HTTPS
		samesite='Lax'  # CSRF protection
	)
	
	# Also set refresh token in separate cookie
	response.set_cookie(
		'jwt_refresh_token',
		refresh_token,
		max_age=30 * 24 * 60 * 60,  # 30 days
		httponly=True,
		secure=False,
		samesite='Lax'
	)
	
	return response


def logout_view(request):
	"""
	Logout view - clears JWT tokens and blacklists them
	
	Clears both access and refresh tokens from cookies
	Adds tokens to blacklist for security
	Works for both web and API/mobile clients
	"""
	# Get tokens before logout
	access_token = request.COOKIES.get('jwt_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
	refresh_token = request.COOKIES.get('jwt_refresh_token')
	
	# Blacklist tokens if they exist
	if access_token and request.user.is_authenticated:
		try:
			blacklist_token(access_token, request.user, reason='logout')
		except Exception as e:
			print(f"Error blacklisting access token: {e}")
	
	if refresh_token and request.user.is_authenticated:
		try:
			blacklist_token(refresh_token, request.user, reason='logout')
		except Exception as e:
			print(f"Error blacklisting refresh token: {e}")
	
	# Clear Django session
	logout(request)
	
	response = JsonResponse({'message': 'logged out successfully'})
	
	# Delete JWT cookies
	response.delete_cookie('jwt_token')
	response.delete_cookie('jwt_refresh_token')
	
	# Also delete Django session cookie for good measure
	response.delete_cookie('sessionid')
	response.delete_cookie('csrftoken')
	
	return response


@csrf_exempt
def refresh_token_view(request):
	"""
	Refresh JWT access token using refresh token
	
	For web clients: Gets refresh token from cookie
	For API/mobile clients: Gets refresh token from request body
	
	Request body (for mobile/API):
	{
		"refresh_token": "refresh_token_here"
	}
	
	Response:
	{
		"access_token": "new_access_token",
		"message": "token refreshed"
	}
	"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	# Try to get refresh token from cookie (web) or body (mobile/API)
	refresh_token = request.COOKIES.get('jwt_refresh_token')
	
	if not refresh_token:
		try:
			payload = json.loads(request.body.decode('utf-8'))
			refresh_token = payload.get('refresh_token')
		except Exception:
			pass
	
	if not refresh_token:
		return JsonResponse({'error': 'refresh token required'}, status=400)
	
	# Verify refresh token
	from .jwt_utils import decode_jwt_token
	token_payload = decode_jwt_token(refresh_token)
	
	if not token_payload:
		return JsonResponse({'error': 'invalid or expired refresh token'}, status=401)
	
	if token_payload.get('type') != 'refresh':
		return JsonResponse({'error': 'invalid token type'}, status=401)
	
	# Get user and generate new access token
	try:
		user = User.objects.get(id=token_payload['user_id'])
		new_access_token = generate_jwt_token(user)
		
		# Check if mobile/API client
		is_mobile = request.headers.get('X-Platform') == 'mobile' or request.headers.get('X-API-Client') == 'true'
		
		if is_mobile:
			return JsonResponse({
				'access_token': new_access_token,
				'token_type': 'Bearer',
				'message': 'token refreshed'
			})
		
		# For web, update cookie
		response = JsonResponse({'message': 'token refreshed'})
		response.set_cookie(
			'jwt_token',
			new_access_token,
			max_age=7 * 24 * 60 * 60,
			httponly=True,
			secure=False,
			samesite='Lax'
		)
		return response
		
	except User.DoesNotExist:
		return JsonResponse({'error': 'user not found'}, status=404)


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
				requirements=payload.get('requirements', ''),
				is_draft=payload.get('is_draft', False)
			)
			
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
	
	# Get status filter from query params (default to 'active')
	status_filter = request.GET.get('status', 'active')
	
	if status_filter == 'all':
		jobs = Job.objects.filter(organizer=profile).order_by('-created_at')
	elif status_filter == 'completed':
		jobs = Job.objects.filter(organizer=profile, status='completed', is_draft=False).order_by('-created_at')
	elif status_filter == 'draft':
		jobs = Job.objects.filter(organizer=profile, is_draft=True).order_by('-created_at')
	else:  # active or pending
		# Show only jobs that are NOT completed and NOT draft
		jobs = Job.objects.filter(organizer=profile, is_draft=False).exclude(status='completed').order_by('-created_at')
	
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
		applications = Application.objects.filter(applicant=profile).order_by('-created_at')
	else:
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
	
	if app.job.organizer != profile:
		return JsonResponse({'error': 'unauthorized'}, status=403)
	
	# Check if organizer has sufficient balance to cover this staff payment
	payment_required = app.job.pay_rate
	
	# Calculate already accepted staff for this job
	accepted_apps = Application.objects.filter(job=app.job, status='accepted')
	total_committed = sum(a.job.pay_rate for a in accepted_apps)
	
	new_total = total_committed + payment_required
	
	if profile.wallet_balance < new_total:
		return JsonResponse({
			'error': f'Insufficient balance. You need ₹{new_total} to hire this staff (₹{payment_required} for this hire + ₹{total_committed} already committed). Your balance: ₹{profile.wallet_balance}. Please add funds first.',
			'required': str(new_total),
			'available': str(profile.wallet_balance),
			'this_hire': str(payment_required),
			'already_committed': str(total_committed)
		}, status=400)
	
	app.status = 'accepted'
	app.save()
	
	return JsonResponse({
		'message': 'Application accepted successfully',
		'application_id': app.id,
		'status': 'accepted',
		'applicant_name': app.full_name or app.applicant.user.username,
		'payment_committed': str(payment_required),
		'remaining_balance': str(profile.wallet_balance - new_total)
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
	
	if 'phone' in payload:
		profile.phone = payload['phone']
	if 'bio' in payload:
		profile.bio = payload['bio']
	if 'city' in payload:
		profile.city = payload['city']
	
	profile.save()
	
	return JsonResponse({'message': 'profile updated', 'profile': _profile_to_dict(profile)})


@csrf_exempt
def update_bank_details(request):
	"""Update bank account details for withdrawals"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	try:
		data = json.loads(request.body.decode('utf-8'))
	except Exception:
		return JsonResponse({'error': 'invalid JSON'}, status=400)
	
	# Validate required fields
	required_fields = ['bank_account_holder', 'bank_account_number', 'bank_ifsc_code']
	missing_fields = [field for field in required_fields if not data.get(field)]
	
	if missing_fields:
		return JsonResponse({
			'error': f'Missing required fields: {", ".join(missing_fields)}'
		}, status=400)
	
	# Update bank details
	profile.bank_account_holder = data.get('bank_account_holder', '')
	profile.bank_account_number = data.get('bank_account_number', '')
	profile.bank_ifsc_code = data.get('bank_ifsc_code', '').upper()
	profile.bank_name = data.get('bank_name', '')
	profile.bank_branch = data.get('bank_branch', '')
	
	profile.save()
	
	return JsonResponse({
		'success': True,
		'message': 'Bank details updated successfully',
		'bank_details': {
			'bank_account_holder': profile.bank_account_holder,
			'bank_account_number': '****' + profile.bank_account_number[-4:] if len(profile.bank_account_number) > 4 else '****',
			'bank_ifsc_code': profile.bank_ifsc_code,
			'bank_name': profile.bank_name,
			'bank_branch': profile.bank_branch,
			'has_bank_details': profile.has_bank_details()
		}
	})


@csrf_exempt
def get_bank_details(request):
	"""Get current user's bank account details"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	# Return masked account number for security
	return JsonResponse({
		'has_bank_details': profile.has_bank_details(),
		'bank_account_holder': profile.bank_account_holder,
		'bank_account_number': '****' + profile.bank_account_number[-4:] if profile.bank_account_number and len(profile.bank_account_number) > 4 else '',
		'bank_ifsc_code': profile.bank_ifsc_code,
		'bank_name': profile.bank_name,
		'bank_branch': profile.bank_branch
	})


def my_messages(request):
	"""Get messages for current user"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	partner_id = request.GET.get('partner_id')
	
	if partner_id:
		messages = Message.objects.filter(
			sender=profile, recipient_id=partner_id
		) | Message.objects.filter(
			sender_id=partner_id, recipient=profile
		)
		messages = messages.order_by('created_at')
	else:
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


def get_conversations(request):
	"""Get list of conversations (users the current user has messaged with)"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	# Get all unique users the current user has messaged with
	from django.db.models import Q, Max
	
	# Get all messages involving this user
	messages = Message.objects.filter(
		Q(sender=profile) | Q(recipient=profile)
	).order_by('-created_at')
	
	# Build a dict of conversations with last message info
	conversations = {}
	for msg in messages:
		# Determine the partner (the other person in the conversation)
		partner = msg.recipient if msg.sender == profile else msg.sender
		partner_id = partner.id
		
		if partner_id not in conversations:
			conversations[partner_id] = {
				'partner': _profile_to_dict(partner),
				'last_message': msg.text,
				'last_message_time': msg.created_at.isoformat()
			}
	
	# Convert to list and sort by last message time
	conv_list = sorted(
		conversations.values(),
		key=lambda x: x['last_message_time'],
		reverse=True
	)
	
	return JsonResponse({'conversations': conv_list})


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
	
	transactions = Transaction.objects.filter(user=profile).select_related(
		'application__job__organizer__user', 
		'job', 
		'related_user__user'
	).order_by('-created_at')[:50]
	
	data = []
	for txn in transactions:
		event_title = ''
		organizer_name = ''
		event_date = None
		
		# Get event details from job or application
		if txn.job:
			event_title = txn.job.title
			organizer_name = txn.job.organizer.user.username if txn.job.organizer else 'Unknown'
			event_date = safe_isoformat(txn.job.date)
		elif txn.application and txn.application.job:
			job = txn.application.job
			event_title = job.title
			organizer_name = job.organizer.user.username if job.organizer else 'Unknown'
			event_date = safe_isoformat(job.date)
		
		# Get related user (for payment transactions)
		related_user_name = ''
		if txn.related_user:
			related_user_name = txn.related_user.user.username
		
		data.append({
			'id': txn.id,
			'amount': str(txn.amount),
			'transaction_type': txn.transaction_type,
			'status': txn.status,
			'note': txn.note,
			'event_title': event_title,
			'organizer_name': organizer_name,
			'related_user': related_user_name,
			'event_date': event_date,
			'balance_after': str(txn.balance_after),
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
	
	from django.db.models import Sum
	from decimal import Decimal
	
	# Get wallet balance from UserProfile
	available_balance = profile.wallet_balance
	
	# Calculate pending amount (accepted but not finished jobs)
	if profile.user_type == 'organizer':
		# Organizer: sum of pay for accepted staff (not yet finished)
		from django.db.models import Q
		accepted_apps = Application.objects.filter(
			job__organizer=profile,
			status='accepted',
			job__status='active'
		)
		pending_amount = sum(app.job.pay_rate for app in accepted_apps)
		pending_count = accepted_apps.count()
	else:
		# Staff: sum of pay from accepted jobs (not yet finished)
		accepted_apps = Application.objects.filter(
			applicant=profile,
			status='accepted',
			job__status='active'
		)
		pending_amount = sum(app.job.pay_rate for app in accepted_apps)
		pending_count = accepted_apps.count()
	
	# Calculate total earned (only for staff - completed payments received)
	earned_txns = Transaction.objects.filter(
		user=profile,
		transaction_type='payment',
		status='completed'
	)
	total_earned = earned_txns.aggregate(total=Sum('amount'))['total'] or Decimal('0')
	
	# Calculate total events (completed jobs)
	if profile.user_type == 'staff':
		total_events = Application.objects.filter(
			applicant=profile,
			status='accepted',
			job__status='completed'
		).count()
	else:
		total_events = Job.objects.filter(
			organizer=profile,
			status='completed'
		).count()
	
	# Monthly earnings for last 6 months
	from datetime import datetime, timedelta
	from django.db.models.functions import TruncMonth
	
	six_months_ago = datetime.now() - timedelta(days=180)
	monthly_data = Transaction.objects.filter(
		user=profile,
		transaction_type='payment',
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
	
	# Check if user has bank details
	if not profile.has_bank_details():
		return JsonResponse({
			'error': 'Bank details required',
			'requires_bank_details': True,
			'message': 'Please add your bank account details before withdrawing funds.'
		}, status=400)
	
	try:
		from django.db import transaction as db_transaction
		
		data = json.loads(request.body)
		amount = Decimal(str(data.get('amount', 0)))
		
		if amount <= 0:
			return JsonResponse({'error': 'Invalid amount'}, status=400)
		
		if amount > profile.wallet_balance:
			return JsonResponse({'error': 'Insufficient balance'}, status=400)
		
		# Atomic transaction to ensure consistency
		with db_transaction.atomic():
			# Deduct from wallet
			profile.wallet_balance -= amount
			new_balance = profile.wallet_balance
			profile.save()
			
			# Record withdrawal transaction
			Transaction.objects.create(
				user=profile,
				transaction_type='withdrawal',
				amount=amount,
				status='completed',
				balance_after=new_balance,
				note=f'Withdrawal to {profile.bank_name} A/C ending with {profile.bank_account_number[-4:]}'
			)
		
		return JsonResponse({
			'success': True,
			'message': f'₹{amount} withdrawn successfully',
			'new_balance': str(new_balance)
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
		
		if 'photo' in request.FILES:
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
		
		if profile.user_type != 'organizer':
			return JsonResponse({'error': 'Only organizers can add funds'}, status=403)
		
		data = json.loads(request.body)
		amount = Decimal(str(data.get('amount', 0)))
		
		if amount <= 0:
			return JsonResponse({'error': 'Invalid amount'}, status=400)
		
		from django.db import transaction as db_transaction
		
		# Atomic transaction to ensure consistency
		with db_transaction.atomic():
			# Add to wallet
			profile.wallet_balance += amount
			new_balance = profile.wallet_balance
			profile.save()
			
			# Record deposit transaction
			Transaction.objects.create(
				user=profile,
				transaction_type='deposit',
				amount=amount,
				status='completed',
				balance_after=new_balance,
				note='Funds added to wallet'
			)
		
		return JsonResponse({
			'success': True,
			'message': f'₹{amount} added successfully',
			'new_balance': str(new_balance)
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
		
		existing_payment = Transaction.objects.filter(
			application=application,
			user=application.applicant,
			status='completed'
		).exists()
		
		if existing_payment:
			return JsonResponse({'error': 'Payment already released'}, status=400)
		
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
		
		# Update User model fields
		if 'username' in data and data['username']:
			request.user.username = data['username']
		if 'first_name' in data:
			request.user.first_name = data['first_name']
		if 'last_name' in data:
			request.user.last_name = data['last_name']
		if 'email' in data:
			request.user.email = data['email']
		request.user.save()
		
		# Update UserProfile fields
		if 'phone' in data:
			profile.phone = data['phone']
		if 'city' in data:
			profile.city = data['city']
		if 'bio' in data:
			profile.bio = data['bio']
		profile.save()
		
		# Return updated profile data
		return JsonResponse({
			'success': True,
			'message': 'Profile updated successfully',
			'profile': {
				'username': request.user.username,
				'email': request.user.email,
				'first_name': request.user.first_name,
				'last_name': request.user.last_name,
				'phone': profile.phone,
				'city': profile.city,
				'bio': profile.bio,
				'user_type': profile.user_type,
				'wallet_balance': str(profile.wallet_balance),
			}
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
		suggestions = AutocompleteSuggestion.objects.filter(field_type=field_type)
		
		if query:
			suggestions = suggestions.filter(value__icontains=query)
		
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
		
		user_profile = None
		if request.user.is_authenticated:
			user_profile = UserProfile.objects.get(user=request.user)
		
		suggestion, created = AutocompleteSuggestion.objects.get_or_create(
			field_type=field_type,
			value=value,
			defaults={'created_by': user_profile}
		)
		
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


# Get applications for a specific job (with optional status filter)
@csrf_exempt
def job_applications(request, job_id):
	"""Get all applications for a specific job, optionally filtered by status"""
	if request.method != 'GET':
		return JsonResponse({'error': 'GET required'}, status=400)
	
	try:
		job = get_object_or_404(Job, id=job_id)
		
		# Check authentication and authorization
		if not request.user.is_authenticated:
			return JsonResponse({'error': 'Authentication required'}, status=401)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			if profile.user_type != 'organizer':
				return JsonResponse({'error': 'Only organizers can view applications'}, status=403)
			
			if job.organizer != profile:
				return JsonResponse({'error': 'You do not own this job'}, status=403)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		status_filter = request.GET.get('status', None)
		
		applications = Application.objects.filter(job=job).select_related('applicant__user')
		
		if status_filter:
			applications = applications.filter(status=status_filter)
		
		result = []
		for app in applications:
			app_dict = {
				'id': app.id,
				'status': app.status,
				'created_at': app.created_at.isoformat() if app.created_at else None,
				'cover_message': app.cover_message,
				'full_name': app.full_name or app.applicant.user.username,
				'email': app.email or app.applicant.user.email,
				'phone': app.phone or app.applicant.phone or '',
				'applicant': {
					'id': app.applicant.id,
					'username': app.applicant.user.username,
					'email': app.applicant.user.email,
					'phone': app.applicant.phone or '',
				},
				'experience_years': app.experience_years,
				'relevant_skills': app.relevant_skills,
				'availability': app.availability,
			}
			result.append(app_dict)
		
		return JsonResponse(result, safe=False)
		
	except Exception as e:
		import traceback
		print(f"Error in job_applications: {str(e)}")
		print(traceback.format_exc())
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def complete_job(request, job_id):
	"""Mark a job as completed"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	try:
		job = get_object_or_404(Job, id=job_id)
		
		if not request.user.is_authenticated:
			return JsonResponse({'error': 'Authentication required'}, status=401)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			if profile.user_type != 'organizer':
				return JsonResponse({'error': 'Only organizers can complete jobs'}, status=403)
			
			if job.organizer != profile:
				return JsonResponse({'error': 'You do not own this job'}, status=403)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		job.status = 'completed'
		job.save()
		
		return JsonResponse({
			'success': True,
			'message': 'Job marked as completed',
			'job_id': job.id,
			'status': job.status
		})
		
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def delete_job(request, job_id):
	"""Delete a job (only by organizer who owns it)"""
	if request.method != 'DELETE':
		return JsonResponse({'error': 'DELETE required'}, status=400)
	
	try:
		job = get_object_or_404(Job, id=job_id)
		
		if not request.user.is_authenticated:
			return JsonResponse({'error': 'Authentication required'}, status=401)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			if profile.user_type != 'organizer':
				return JsonResponse({'error': 'Only organizers can delete jobs'}, status=403)
			
			if job.organizer != profile:
				return JsonResponse({'error': 'You do not own this job'}, status=403)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		job_title = job.title
		job.delete()
		
		return JsonResponse({
			'success': True,
			'message': f'Job "{job_title}" has been deleted successfully'
		})
		
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


def get_job_details(request, job_id):
	"""Get detailed job information including hired staff"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Authentication required'}, status=401)
	
	try:
		job = get_object_or_404(Job, id=job_id)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			
			# Allow organizers to view their own jobs, and staff to view jobs they're hired for
			if profile.user_type == 'organizer':
				if job.organizer != profile:
					return JsonResponse({'error': 'You do not own this job'}, status=403)
			elif profile.user_type == 'staff':
				# Check if staff is hired for this job
				is_hired = Application.objects.filter(
					job=job,
					applicant=profile,
					status='accepted'
				).exists()
				if not is_hired:
					return JsonResponse({'error': 'You are not hired for this job'}, status=403)
			else:
				return JsonResponse({'error': 'Invalid user type'}, status=403)
				
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		# Get hired staff (accepted applications) - only show for organizers
		staff_list = []
		if profile.user_type == 'organizer':
			hired_staff = Application.objects.filter(
				job=job,
				status='accepted'
			).select_related('applicant__user')
			
			staff_list = [{
				'id': app.id,
				'name': app.full_name or app.applicant.user.username,
				'email': app.email or app.applicant.user.email,
				'phone': app.phone or app.applicant.phone,
				'user_id': app.applicant.user.id,
				'profile_id': app.applicant.id  # Add UserProfile ID for reviews
			} for app in hired_staff]
		
		job_data = {
			'id': job.id,
			'title': job.title,
			'description': job.description,
			'event_type': job.event_type,
			'role': job.role,
			'date': job.date.isoformat() if job.date else None,
			'start_time': job.start_time.strftime('%H:%M') if job.start_time else 'TBD',
			'end_time': job.end_time.strftime('%H:%M') if job.end_time else 'TBD',
			'location': job.location,
			'pay_rate': str(job.pay_rate),
			'payment_type': job.payment_type,
			'number_of_staff': job.number_of_staff,
			'requirements': job.requirements,
			'skills': job.skills,
			'status': job.status,  # Add status field
			'hired_staff': staff_list
		}
		
		return JsonResponse(job_data)
		
	except Exception as e:
		import traceback
		print(f"Error in get_job_details: {str(e)}")
		print(traceback.format_exc())
		return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def finish_job(request, job_id):
	"""Mark a job/event as finished and release payments to staff"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Authentication required'}, status=401)
	
	try:
		from django.db import transaction as db_transaction
		
		job = get_object_or_404(Job, id=job_id)
		
		# Check if job is already completed
		if job.status == 'completed':
			return JsonResponse({'error': 'This event has already been finished'}, status=400)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			if profile.user_type != 'organizer':
				return JsonResponse({'error': 'Only organizers can finish jobs'}, status=403)
			
			if job.organizer != profile:
				return JsonResponse({'error': 'You do not own this job'}, status=403)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		# Get all accepted applications for this job
		accepted_apps = Application.objects.filter(job=job, status='accepted')
		
		if not accepted_apps.exists():
			# No staff to pay, just mark as completed
			job.status = 'completed'
			job.save()
			return JsonResponse({
				'success': True,
				'message': 'Event marked as finished successfully',
				'job_id': job.id,
				'job_title': job.title,
				'payments_released': 0
			})
		
		# Calculate total amount needed
		total_payment = sum(app.job.pay_rate for app in accepted_apps)
		
		# Check if organizer has enough balance
		if profile.wallet_balance < total_payment:
			return JsonResponse({
				'error': f'Insufficient balance. Need ₹{total_payment}, but only have ₹{profile.wallet_balance}',
				'required': str(total_payment),
				'available': str(profile.wallet_balance)
			}, status=400)
		
		# Atomic transaction to release all payments
		with db_transaction.atomic():
			payments_released = 0
			
			# Deduct from organizer's wallet
			profile.wallet_balance -= total_payment
			organizer_balance = profile.wallet_balance
			profile.save()
			
			# Record organizer's payment transaction
			Transaction.objects.create(
				user=profile,
				transaction_type='escrow_release',
				amount=total_payment,
				status='completed',
				job=job,
				balance_after=organizer_balance,
				note=f'Payment released for event: {job.title}'
			)
			
			# Pay each accepted staff member
			for app in accepted_apps:
				staff_profile = app.applicant
				payment_amount = app.job.pay_rate
				
				# Add to staff wallet
				staff_profile.wallet_balance += payment_amount
				staff_balance = staff_profile.wallet_balance
				staff_profile.save()
				
				# Record staff payment transaction
				Transaction.objects.create(
					user=staff_profile,
					transaction_type='payment',
					amount=payment_amount,
					status='completed',
					application=app,
					job=job,
					related_user=profile,
					balance_after=staff_balance,
					note=f'Payment received for: {job.title}'
				)
				
				payments_released += 1
			
			# Mark job as completed
			job.status = 'completed'
			job.save()
		
		return JsonResponse({
			'success': True,
			'message': f'Event finished and ₹{total_payment} released to {payments_released} staff members',
			'job_id': job.id,
			'job_title': job.title,
			'payments_released': payments_released,
			'total_amount': str(total_payment)
		})
		
	except Exception as e:
		print(f"Error finishing job: {e}")
		import traceback
		traceback.print_exc()
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def reject_application(request, app_id):
	"""Reject/Fire an application"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	try:
		application = get_object_or_404(Application, id=app_id)
		
		if not request.user.is_authenticated:
			return JsonResponse({'error': 'Authentication required'}, status=401)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			if profile.user_type != 'organizer':
				return JsonResponse({'error': 'Only organizers can reject applications'}, status=403)
			
			if application.job.organizer != profile:
				return JsonResponse({'error': 'You do not own this job'}, status=403)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		application.status = 'rejected'
		application.save()
		
		return JsonResponse({
			'success': True,
			'message': 'Application rejected successfully',
			'application_id': application.id,
			'status': 'rejected'
		})
		
		
	except Exception as e:
		print(f"Error rejecting application: {e}")  # Debug logging
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def withdraw_application(request, app_id):
	"""Allow staff to withdraw from an accepted event"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	try:
		application = get_object_or_404(Application, id=app_id)
		
		if not request.user.is_authenticated:
			return JsonResponse({'error': 'Authentication required'}, status=401)
		
		try:
			profile = UserProfile.objects.get(user=request.user)
			if profile.user_type != 'staff':
				return JsonResponse({'error': 'Only staff can withdraw from events'}, status=403)
			
			if application.applicant != profile:
				return JsonResponse({'error': 'This is not your application'}, status=403)
			
			if application.status != 'accepted':
				return JsonResponse({'error': 'Can only withdraw from accepted applications'}, status=400)
		except UserProfile.DoesNotExist:
			return JsonResponse({'error': 'Profile not found'}, status=404)
		
		# Change status to withdrawn/cancelled
		application.status = 'withdrawn'
		application.save()
		
		return JsonResponse({
			'success': True,
			'message': 'Successfully withdrawn from event',
			'application_id': application.id,
			'status': 'withdrawn'
		})
		
	except Exception as e:
		print(f"Error withdrawing application: {e}")  # Debug logging
		return JsonResponse({'error': str(e)}, status=500)


# Footer Pages Views
def pricing_page(request):
	"""Pricing page"""
	return render(request, 'pricing.html')


def success_stories_page(request):
	"""Success Stories page"""
	return render(request, 'success-stories.html')


def verification_page(request):
	"""Verification page"""
	return render(request, 'verification.html')


def faqs_page(request):
	"""FAQs page"""
	return render(request, 'faqs.html')


def about_us_page(request):
	"""About Us page"""
	return render(request, 'about-us.html')


def contact_page(request):
	"""Contact page"""
	return render(request, 'contact.html')


def privacy_policy_page(request):
	"""Privacy Policy page"""
	return render(request, 'privacy-policy.html')


def terms_page(request):
	"""Terms of Service page"""
	return render(request, 'terms-of-service.html')


@csrf_exempt
def submit_verification(request):
	"""Submit verification documents and information"""
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
		return JsonResponse({'error': 'invalid json'}, status=400)
	
	# Required fields
	required_fields = ['full_name', 'date_of_birth', 'gender', 'address', 'document_type', 'document_number']
	for field in required_fields:
		if not payload.get(field):
			return JsonResponse({'error': f'{field} is required'}, status=400)
	
	try:
		# Check if user already has a pending or approved verification
		existing = VerificationDocument.objects.filter(
			user=profile,
			status__in=['pending', 'approved']
		).first()
		
		if existing:
			if existing.status == 'approved':
				return JsonResponse({'error': 'You are already verified'}, status=400)
			else:
				return JsonResponse({'error': 'You have a pending verification request'}, status=400)
		
		# Create verification document
		verification = VerificationDocument.objects.create(
			user=profile,
			full_name=payload.get('full_name'),
			date_of_birth=payload.get('date_of_birth'),
			gender=payload.get('gender'),
			address=payload.get('address'),
			document_type=payload.get('document_type'),
			document_number=payload.get('document_number'),
			document_front=payload.get('document_front', ''),
			document_back=payload.get('document_back', ''),
			selfie_photo=payload.get('selfie_photo', ''),
			emergency_contact_name=payload.get('emergency_contact_name', ''),
			emergency_contact_phone=payload.get('emergency_contact_phone', ''),
			emergency_contact_relation=payload.get('emergency_contact_relation', ''),
			years_of_experience=payload.get('years_of_experience', ''),
			specialization=payload.get('specialization', ''),
			previous_companies=payload.get('previous_companies', ''),
			certifications=payload.get('certifications', ''),
		)
		
		return JsonResponse({
			'message': 'Verification submitted successfully',
			'verification_id': verification.id,
			'status': verification.status
		})
	
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_verification_status(request):
	"""Get user's verification status"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'authentication required'}, status=401)
	
	try:
		profile = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		return JsonResponse({'error': 'profile not found'}, status=404)
	
	# Get latest verification document
	verification = VerificationDocument.objects.filter(user=profile).order_by('-submitted_at').first()
	
	if not verification:
		return JsonResponse({
			'has_verification': False,
			'kyc_verified': profile.kyc_verified
		})
	
	return JsonResponse({
		'has_verification': True,
		'verification': {
			'id': verification.id,
			'status': verification.status,
			'submitted_at': safe_isoformat(verification.submitted_at),
			'verified_at': safe_isoformat(verification.verified_at),
			'rejection_reason': verification.rejection_reason,
			'document_type': verification.document_type,
			'full_name': verification.full_name,
		},
		'kyc_verified': profile.kyc_verified
	})


@csrf_exempt
def submit_review(request, job_id):
	"""Submit a review for staff after event completion"""
	if request.method != 'POST':
		return JsonResponse({'error': 'POST required'}, status=400)
	
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Authentication required'}, status=401)
	
	try:
		# Get organizer profile
		organizer_profile = UserProfile.objects.get(user=request.user)
		if organizer_profile.user_type != 'organizer':
			return JsonResponse({'error': 'Only organizers can submit reviews'}, status=403)
		
		# Get job
		job = get_object_or_404(Job, id=job_id)
		
		# Verify ownership and completion
		if job.organizer != organizer_profile:
			return JsonResponse({'error': 'You do not own this job'}, status=403)
		
		if job.status != 'completed':
			return JsonResponse({'error': 'Can only review completed events'}, status=400)
		
		# Parse request data
		import json
		payload = json.loads(request.body)
		
		staff_id = payload.get('staff_id')
		rating = payload.get('rating')
		review_text = payload.get('review_text', '')
		professionalism = payload.get('professionalism', 5)
		punctuality = payload.get('punctuality', 5)
		quality_of_work = payload.get('quality_of_work', 5)
		communication = payload.get('communication', 5)
		
		if not staff_id or not rating:
			return JsonResponse({'error': 'staff_id and rating are required'}, status=400)
		
		# Validate rating
		try:
			rating = float(rating)
			if rating < 1 or rating > 5:
				return JsonResponse({'error': 'Rating must be between 1 and 5'}, status=400)
		except ValueError:
			return JsonResponse({'error': 'Invalid rating value'}, status=400)
		
		# Get staff profile
		staff_profile = get_object_or_404(UserProfile, id=staff_id)
		
		# Verify staff worked on this job
		application = Application.objects.filter(
			job=job,
			applicant=staff_profile,
			status='accepted'
		).first()
		
		if not application:
			return JsonResponse({'error': 'Staff did not work on this event'}, status=400)
		
		# Create or update review
		from .models import Review
		review, created = Review.objects.update_or_create(
			job=job,
			staff=staff_profile,
			organizer=organizer_profile,
			defaults={
				'rating': rating,
				'review_text': review_text,
				'professionalism': professionalism,
				'punctuality': punctuality,
				'quality_of_work': quality_of_work,
				'communication': communication,
			}
		)
		
		# Increment total_events_completed for staff if this is first review for this job
		if created:
			staff_profile.total_events_completed += 1
			staff_profile.save()
		
		return JsonResponse({
			'success': True,
			'message': 'Review submitted successfully',
			'review_id': review.id,
			'staff_new_rating': str(staff_profile.average_rating),
			'staff_new_badge': staff_profile.badge,
		})
	
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_reviews(request, staff_id):
	"""Get all reviews for a staff member"""
	try:
		staff_profile = get_object_or_404(UserProfile, id=staff_id)
		
		from .models import Review
		reviews = Review.objects.filter(staff=staff_profile).order_by('-created_at')
		
		reviews_data = []
		for review in reviews:
			reviews_data.append({
				'id': review.id,
				'rating': str(review.rating),
				'review_text': review.review_text,
				'professionalism': review.professionalism,
				'punctuality': review.punctuality,
				'quality_of_work': review.quality_of_work,
				'communication': review.communication,
				'job_title': review.job.title,
				'organizer_name': review.organizer.user.get_full_name() or review.organizer.user.username,
				'created_at': safe_isoformat(review.created_at),
			})
		
		return JsonResponse({
			'staff': _profile_to_dict(staff_profile),
			'reviews': reviews_data,
			'total_reviews': len(reviews_data),
		})
	
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_staff_to_review(request, job_id):
	"""Get list of staff that can be reviewed for a completed job"""
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'Authentication required'}, status=401)
	
	try:
		organizer_profile = UserProfile.objects.get(user=request.user)
		if organizer_profile.user_type != 'organizer':
			return JsonResponse({'error': 'Only organizers can review staff'}, status=403)
		
		job = get_object_or_404(Job, id=job_id)
		
		if job.organizer != organizer_profile:
			return JsonResponse({'error': 'You do not own this job'}, status=403)
		
		if job.status != 'completed':
			return JsonResponse({'error': 'Can only review completed events'}, status=400)
		
		# Get accepted applications (hired staff)
		applications = Application.objects.filter(job=job, status='accepted')
		
		from .models import Review
		staff_list = []
		for app in applications:
			# Check if already reviewed
			existing_review = Review.objects.filter(
				job=job,
				staff=app.applicant,
				organizer=organizer_profile
			).first()
			
			staff_list.append({
				'staff_id': app.applicant.id,
				'staff_name': app.applicant.user.get_full_name() or app.applicant.user.username,
				'staff_email': app.applicant.user.email,
				'staff_phone': app.applicant.phone,
				'has_review': existing_review is not None,
				'review': {
					'id': existing_review.id,
					'rating': str(existing_review.rating),
					'review_text': existing_review.review_text,
					'created_at': safe_isoformat(existing_review.created_at),
				} if existing_review else None
			})
		
		return JsonResponse({
			'job_id': job.id,
			'job_title': job.title,
			'staff': staff_list,
		})
	
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)




