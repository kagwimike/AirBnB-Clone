from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, ProfileView
from .views import RegisterView, CustomTokenObtainPairView, ProfileView, ModeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('mode/', ModeView.as_view(), name='auth_mode'),
]