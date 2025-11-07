from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.jobs_list, name='jobs_list'),
    path('jobs/create/', views.create_job, name='create_job'),
    path('jobs/my/', views.my_jobs, name='my_jobs'),
    path('jobs/<int:job_id>/', views.job_detail, name='job_detail'),
    path('jobs/<int:job_id>/apply/', views.apply_job, name='apply_job'),

    path('talent/', views.talent_list, name='talent_list'),
    path('profiles/<int:pk>/', views.profile_detail, name='profile_detail'),
    path('profiles/update/', views.update_profile, name='update_profile'),

    path('applications/', views.my_applications, name='my_applications'),
    path('applications/<int:app_id>/status/', views.update_application_status, name='update_application_status'),

    path('messages/', views.my_messages, name='my_messages'),
    path('messages/send/', views.send_message, name='send_message'),
    path('messages/send-api/', views.send_message_api, name='send_message_api'),

    path('transactions/', views.my_transactions, name='my_transactions'),
    path('wallet/stats/', views.wallet_stats, name='wallet_stats'),
    path('wallet/withdraw/', views.withdraw_funds, name='withdraw_funds'),
    path('wallet/add-funds/', views.add_funds, name='add_funds'),

    path('upload/photo/', views.upload_profile_photo, name='upload_photo'),
    path('upload/video/', views.upload_video_intro, name='upload_video'),
    
    path('jobs/<int:job_id>/track-attendance/', views.track_attendance, name='track_attendance'),
    path('jobs/<int:job_id>/download-report/', views.download_report, name='download_report'),
    
    path('applications/<int:application_id>/release-payment/', views.release_payment, name='release_payment'),
    
    path('profile/save/', views.save_profile, name='save_profile'),

    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
]
