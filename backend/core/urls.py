"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),
    
    # API Routes
    # All authentication-related routes will be prefixed with /api/auth/
    path('api/auth/', include('accounts.urls')),
    
    # Later, we will add properties, bookings, and payments here:
    path('api/properties/', include('properties.urls')),
    # path('api/bookings/', include('bookings.urls')),
    # path('api/payments/', include('payments.urls')),
   path('api/bookings/',include('bookings.urls')),
   path('api/payments/',include('payments.urls')),
]