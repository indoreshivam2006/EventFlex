"""
URL configuration for EventFlex project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from EventFlex_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Frontend pages
    path('', views.index_view, name='index'),
    path('login/', views.login_page_view, name='login_page'),
    path('signup/', views.signup_page_view, name='signup_page'),
    path('staff-portal/', views.staff_portal_view, name='staff_portal'),
    path('organizer-dashboard/', views.organizer_dashboard_view, name='organizer_dashboard'),
    path('api-docs/', views.api_docs_view, name='api_docs'),
    
    # API endpoints
    path('api/', include('EventFlex_app.urls')),
]
