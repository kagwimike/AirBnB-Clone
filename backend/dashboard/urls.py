from django.urls import path

from .views import (
    GuestBookingDetailView,
    GuestBookingListView,
    HostEarningsView,
    HostListingsView,
    HostReservationsView,
    HostSummaryView,
)

urlpatterns = [
    path('guest/bookings/', GuestBookingListView.as_view(), name='dashboard-guest-bookings'),
    path('guest/bookings/<int:pk>/detail/', GuestBookingDetailView.as_view(), name='dashboard-guest-booking-detail'),
    path('host/summary/', HostSummaryView.as_view(), name='dashboard-host-summary'),
    path('host/listings/', HostListingsView.as_view(), name='dashboard-host-listings'),
    path('host/reservations/', HostReservationsView.as_view(), name='dashboard-host-reservations'),
    path('host/earnings/', HostEarningsView.as_view(), name='dashboard-host-earnings'),
]
