from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
	USER_TYPES = (('organizer', 'Organizer'), ('staff', 'EventPro'))
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	user_type = models.CharField(max_length=20, choices=USER_TYPES, default='staff')
	city = models.CharField(max_length=120, blank=True)
	phone = models.CharField(max_length=32, blank=True)
	bio = models.TextField(blank=True)
	kyc_verified = models.BooleanField(default=False)
	video_verified = models.BooleanField(default=False)
	badge = models.CharField(max_length=32, blank=True)

	def __str__(self):
		return f"{self.user.username} ({self.user_type})"


class Job(models.Model):
	organizer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='jobs')
	title = models.CharField(max_length=200)
	event_type = models.CharField(max_length=100, blank=True)
	role = models.CharField(max_length=150)
	number_of_staff = models.PositiveIntegerField(default=1)
	skills = models.CharField(max_length=400, blank=True)
	date = models.DateField(null=True, blank=True)
	start_time = models.TimeField(null=True, blank=True)
	end_time = models.TimeField(null=True, blank=True)
	location = models.CharField(max_length=300, blank=True)
	pay_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	payment_type = models.CharField(max_length=32, default='event')
	description = models.TextField(blank=True)
	requirements = models.CharField(max_length=400, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.title} - {self.organizer}"


class Application(models.Model):
	job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
	applicant = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='applications')
	cover_message = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=32, default='pending')
	
	# Detailed application fields
	full_name = models.CharField(max_length=200, blank=True)
	email = models.EmailField(blank=True)
	phone = models.CharField(max_length=32, blank=True)
	experience_years = models.CharField(max_length=50, blank=True, default='')  # Changed to CharField to support "3-5", "10+" etc
	relevant_skills = models.TextField(blank=True)
	availability = models.CharField(max_length=500, blank=True)
	portfolio_link = models.URLField(max_length=500, blank=True)
	previous_events = models.TextField(blank=True)
	why_interested = models.TextField(blank=True)
	expected_compensation = models.CharField(max_length=100, blank=True, default='')  # Changed to CharField for flexibility

	def __str__(self):
		return f"{self.applicant} -> {self.job} ({self.status})"


class Transaction(models.Model):
	TRANSACTION_STATUS = (('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed'))
	user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='transactions')
	application = models.ForeignKey(Application, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	status = models.CharField(max_length=32, choices=TRANSACTION_STATUS, default='pending')
	note = models.CharField(max_length=300, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user} {self.amount} ({self.status})"


class Message(models.Model):
	sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
	recipient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_messages')
	text = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.sender} -> {self.recipient}"


class AutocompleteSuggestion(models.Model):
	"""Store autocomplete suggestions for forms"""
	FIELD_TYPES = (
		('event_type', 'Event Type'),
		('role', 'Role/Position'),
		('skills', 'Skills'),
		('location', 'Location'),
		('requirements', 'Requirements'),
		('city', 'City'),
		('previous_events', 'Previous Events'),
	)
	
	field_type = models.CharField(max_length=50, choices=FIELD_TYPES)
	value = models.CharField(max_length=500)
	usage_count = models.PositiveIntegerField(default=1)
	created_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	
	class Meta:
		unique_together = ('field_type', 'value')
		ordering = ['-usage_count', '-updated_at']
	
	def __str__(self):
		return f"{self.field_type}: {self.value}"


