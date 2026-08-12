from django.urls import path
from .views import MpesaCheckoutView, MpesaCallbackView

urlpatterns = [
    path(
        'checkout/',
        MpesaCheckoutView.as_view(),
        name='mpesa-checkout'
    ),

    path(
        'callback/',
        MpesaCallbackView.as_view(),
        name='mpesa-callback'
    ),
]