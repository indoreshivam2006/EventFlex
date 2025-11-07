from django.contrib import admin
from .models import UserProfile, Job, Application, Transaction, Message, AutocompleteSuggestion, BlacklistedToken

# Register your models here.


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'user_type', 'city', 'kyc_verified', 'badge')
	search_fields = ('user__username', 'user__email', 'city')


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

