from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.jobs_list, name='jobs_list'),
    path('jobs/create/', views.create_job, name='create_job'),
    path('jobs/my/', views.my_jobs, name='my_jobs'),
    path('jobs/<int:job_id>/', views.job_detail, name='job_detail'),
    path('jobs/<int:job_id>/apply/', views.apply_job, name='apply_job'),
    path('jobs/<int:job_id>/applications/', views.job_applications, name='job_applications'),
    path('jobs/<int:job_id>/complete/', views.complete_job, name='complete_job'),
    path('jobs/<int:job_id>/delete/', views.delete_job, name='delete_job'),
    path('jobs/<int:job_id>/details/', views.get_job_details, name='get_job_details'),
    path('jobs/<int:job_id>/finish/', views.finish_job, name='finish_job'),

    path('talent/', views.talent_list, name='talent_list'),
    path('profiles/<int:pk>/', views.profile_detail, name='profile_detail'),
    path('profiles/update/', views.update_profile, name='update_profile'),

    path('applications/', views.my_applications, name='my_applications'),
    path('applications/<int:app_id>/', views.get_application_detail, name='get_application_detail'),
    path('applications/<int:app_id>/status/', views.update_application_status, name='update_application_status'),
    path('applications/<int:app_id>/accept/', views.accept_application, name='accept_application'),
    path('applications/<int:app_id>/reject/', views.reject_application, name='reject_application'),
    path('applications/<int:app_id>/withdraw/', views.withdraw_application, name='withdraw_application'),

    path('messages/', views.my_messages, name='my_messages'),
    path('messages/conversations/', views.get_conversations, name='get_conversations'),
    path('messages/send/', views.send_message, name='send_message'),
    path('messages/send-api/', views.send_message_api, name='send_message_api'),

    path('transactions/', views.my_transactions, name='my_transactions'),
    path('wallet/stats/', views.wallet_stats, name='wallet_stats'),
    path('wallet/withdraw/', views.withdraw_funds, name='withdraw_funds'),
    path('wallet/add-funds/', views.add_funds, name='add_funds'),
    path('wallet/bank-details/', views.get_bank_details, name='get_bank_details'),
    path('wallet/bank-details/update/', views.update_bank_details, name='update_bank_details'),

    path('upload/photo/', views.upload_profile_photo, name='upload_photo'),
    path('upload/video/', views.upload_video_intro, name='upload_video'),
    
    path('jobs/<int:job_id>/track-attendance/', views.track_attendance, name='track_attendance'),
    path('jobs/<int:job_id>/download-report/', views.download_report, name='download_report'),
    
    path('applications/<int:application_id>/release-payment/', views.release_payment, name='release_payment'),
    
    path('profile/save/', views.save_profile, name='save_profile'),

    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', views.refresh_token_view, name='refresh_token'),
    
    # Autocomplete endpoints
    path('autocomplete/suggestions/', views.get_autocomplete_suggestions, name='get_autocomplete_suggestions'),
    path('autocomplete/save/', views.save_autocomplete_suggestion, name='save_autocomplete_suggestion'),
    
    # Verification endpoints
    path('verification/submit/', views.submit_verification, name='submit_verification'),
    path('verification/status/', views.get_verification_status, name='get_verification_status'),
    
    # Review endpoints
    path('reviews/submit/<int:job_id>/', views.submit_review, name='submit_review'),
    path('reviews/staff/<int:staff_id>/', views.get_reviews, name='get_reviews'),
    path('reviews/job/<int:job_id>/staff/', views.get_staff_to_review, name='get_staff_to_review'),
    
    # Footer pages
    path('pricing/', views.pricing_page, name='pricing_page'),
    path('success-stories/', views.success_stories_page, name='success_stories_page'),
    path('verification/', views.verification_page, name='verification_page'),
    path('faqs/', views.faqs_page, name='faqs_page'),
    path('about-us/', views.about_us_page, name='about_us_page'),
    path('contact/', views.contact_page, name='contact_page'),
    path('privacy-policy/', views.privacy_policy_page, name='privacy_policy_page'),
    path('terms-of-service/', views.terms_page, name='terms_page'),
]
