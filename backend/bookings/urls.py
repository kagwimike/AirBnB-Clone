from django.urls import path
from dashboard.views import GuestBookingDetailView
from .views import BookingListView, BookingCancelView, HostBookingTransitionView, ConversationDetailView, MessageCreateView, NotificationListView, NotificationReadView, IssueListCreateView, IssueResolveView, GuestReviewCreateView

urlpatterns = [
   path(
        '',
        BookingListView.as_view(),
        name='booking-list'
    ),
    path('<int:booking_id>/conversation/', ConversationDetailView.as_view(), name='booking-conversation'),
    path('<int:pk>/detail/', GuestBookingDetailView.as_view(), name='booking-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageCreateView.as_view(), name='conversation-message'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path(
        '<int:pk>/cancel/',
        BookingCancelView.as_view(),
        name='booking-cancel'
    ),
    path('<int:pk>/host-transition/', HostBookingTransitionView.as_view(), name='booking-host-transition'),
    path('issues/', IssueListCreateView.as_view(), name='booking-issues'),
    path('issues/<int:pk>/resolve/', IssueResolveView.as_view(), name='booking-issue-resolve'),
    path('guest-reviews/', GuestReviewCreateView.as_view(), name='booking-guest-review'),
]
