from django.contrib import admin
from .models import UserProfile, Job, Application, Transaction, Message, AutocompleteSuggestion, BlacklistedToken, VerificationDocument, Review

# Register your models here.


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'user_type', 'city', 'kyc_verified', 'badge', 'average_rating', 'total_reviews')
	search_fields = ('user__username', 'user__email', 'city')
	list_filter = ('badge', 'user_type')


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
	list_display = ('title', 'organizer', 'date', 'location', 'pay_rate')
	search_fields = ('title', 'organizer__user__username', 'location')
	list_filter = ('event_type',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
	list_display = ('job', 'applicant', 'status', 'created_at')
	search_fields = ('job__title', 'applicant__user__username')
	list_filter = ('status',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
	list_display = ('user', 'amount', 'created_at')
	search_fields = ('user__user__username',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
	list_display = ('sender', 'recipient', 'created_at')
	search_fields = ('sender__user__username', 'recipient__user__username')


@admin.register(AutocompleteSuggestion)
class AutocompleteSuggestionAdmin(admin.ModelAdmin):
	list_display = ('field_type', 'value', 'usage_count', 'created_at')
	search_fields = ('value',)
	list_filter = ('field_type',)


@admin.register(BlacklistedToken)
class BlacklistedTokenAdmin(admin.ModelAdmin):
	list_display = ('user', 'blacklisted_at', 'expires_at', 'reason')
	search_fields = ('user__username', 'user__email', 'token')
	list_filter = ('reason', 'blacklisted_at')
	readonly_fields = ('token', 'user', 'blacklisted_at', 'expires_at', 'reason')
	
	def has_add_permission(self, request):
		# Prevent manual addition through admin
		return False


@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
	list_display = ('user', 'full_name', 'document_type', 'status', 'submitted_at', 'verified_at')
	search_fields = ('user__user__username', 'full_name', 'document_number')
	list_filter = ('status', 'document_type', 'gender', 'submitted_at')
	readonly_fields = ('submitted_at', 'updated_at')
	actions = ['approve_verification', 'reject_verification']
	
	fieldsets = (
		('User Information', {
			'fields': ('user', 'status', 'verified_by', 'verified_at', 'rejection_reason')
		}),
		('Personal Details', {
			'fields': ('full_name', 'date_of_birth', 'gender', 'address')
		}),
		('Document Information', {
			'fields': ('document_type', 'document_number')
		}),
		('Emergency Contact', {
			'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation')
		}),
		('Professional Details', {
			'fields': ('years_of_experience', 'specialization', 'previous_companies', 'certifications')
		}),
		('Timestamps', {
			'fields': ('submitted_at', 'updated_at')
		}),
	)
	
	def approve_verification(self, request, queryset):
		"""Approve selected verification requests and update user KYC status"""
		from django.utils import timezone
		
		count = 0
		for verification in queryset.filter(status='pending'):
			verification.status = 'approved'
			verification.verified_by = request.user
			verification.verified_at = timezone.now()
			verification.save()
			
			# Update UserProfile KYC status
			user_profile = verification.user
			user_profile.kyc_verified = True
			user_profile.save()
			
			count += 1
		
		self.message_user(request, f'{count} verification(s) approved successfully and KYC status updated.')
	approve_verification.short_description = "✅ Approve selected verifications"
	
	def reject_verification(self, request, queryset):
		"""Reject selected verification requests"""
		count = queryset.filter(status='pending').update(
			status='rejected',
			verified_by=request.user
		)
		self.message_user(request, f'{count} verification(s) rejected.')
	reject_verification.short_description = "❌ Reject selected verifications"
	
	def get_queryset(self, request):
		"""Show pending verifications first"""
		qs = super().get_queryset(request)
		return qs.order_by('-status', '-submitted_at')  # pending first, then by date


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = ('staff', 'organizer', 'job', 'rating', 'created_at')
	search_fields = ('staff__user__username', 'organizer__user__username', 'job__title')
	list_filter = ('rating', 'created_at')
	readonly_fields = ('created_at', 'updated_at')



