from django.urls import path
from .views import BookingListView, BookingCancelView, ConversationDetailView, MessageCreateView, NotificationListView, NotificationReadView

urlpatterns = [
   path(
        '',
        BookingListView.as_view(),
        name='booking-list'
    ),
    path('<int:booking_id>/conversation/', ConversationDetailView.as_view(), name='booking-conversation'),
    path('conversations/<int:conversation_id>/messages/', MessageCreateView.as_view(), name='conversation-message'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path(
        '<int:pk>/cancel/',
        BookingCancelView.as_view(),
        name='booking-cancel'
    ),
]
