
from django.contrib import admin
from django.urls import path, include
from EventFlex_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Frontend pages
    path('', views.index_view, name='home'),
    path('login/', views.login_page_view, name='login_page'),
    path('signup/', views.signup_page_view, name='signup_page'),
    path('staff-portal/', views.staff_portal_view, name='staff_portal'),
    path('organizer-dashboard/', views.organizer_dashboard_view, name='organizer_dashboard'),
    path('api-docs/', views.api_docs_view, name='api_docs'),
    
    # Footer pages
    path('pricing/', views.pricing_page, name='pricing_page'),
    path('success-stories/', views.success_stories_page, name='success_stories_page'),
    path('verification/', views.verification_page, name='verification_page'),
    path('faqs/', views.faqs_page, name='faqs_page'),
    path('about-us/', views.about_us_page, name='about_us_page'),
    path('contact/', views.contact_page, name='contact_page'),
    path('privacy-policy/', views.privacy_policy_page, name='privacy_policy_page'),
    path('terms-of-service/', views.terms_page, name='terms_page'),
    
    # API endpoints
    path('api/', include('EventFlex_app.urls')),
]
