from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from bookings.models import Booking
from payments.models import Payment
from properties.models import Property
from .serializers import DashboardBookingSerializer, HostEarningSerializer, HostListingSerializer


class DashboardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class GuestPermission(permissions.IsAuthenticated):
    pass


class HostPermission(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'HOST' and request.user.mode == 'HOSTING'


class GuestBookingQueryMixin:
    serializer_class = DashboardBookingSerializer
    permission_classes = [GuestPermission]
    pagination_class = DashboardPagination

    def get_queryset(self):
        queryset = Booking.objects.filter(user=self.request.user).select_related(
            'property', 'property__host', 'review'
        ).prefetch_related('property__images')
        status_filter = self.request.query_params.get('status')
        today = timezone.localdate()
        if status_filter == 'upcoming':
            queryset = queryset.filter(payment_status__in=('CONFIRMED', 'CHECKED_IN'), check_in_date__gte=today)
        elif status_filter == 'past':
            queryset = queryset.filter(payment_status__in=('COMPLETED', 'CONFIRMED'), check_out_date__lt=today)
        elif status_filter == 'pending':
            queryset = queryset.filter(payment_status='PENDING')
        elif status_filter == 'cancelled':
            queryset = queryset.filter(payment_status='CANCELLED')
        return queryset.order_by('check_in_date')


class GuestBookingListView(GuestBookingQueryMixin, generics.ListAPIView):
    pass


class GuestBookingDetailView(generics.RetrieveAPIView):
    serializer_class = DashboardBookingSerializer
    permission_classes = [GuestPermission]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'property', 'property__host', 'review'
        ).prefetch_related('property__images')


class HostQueryMixin:
    permission_classes = [HostPermission]

    def get_host_bookings(self):
        return Booking.objects.filter(property__host=self.request.user).select_related(
            'property', 'user', 'property__host'
        ).prefetch_related('property__images').order_by('check_in_date')


class HostSummaryView(generics.GenericAPIView):
    permission_classes = [HostPermission]

    def get(self, request):
        today = timezone.localdate()
        month_start = today.replace(day=1)
        properties = Property.objects.filter(host=request.user)
        bookings = Booking.objects.filter(property__host=request.user)
        completed_payments = Payment.objects.filter(
            booking__property__host=request.user,
            status='COMPLETED',
            created_at__date__gte=month_start,
        )
        upcoming_week = bookings.filter(
            payment_status='CONFIRMED',
            check_in_date__gte=today,
            check_in_date__lte=today + timedelta(days=7),
        ).count()
        return Response({
            'active_listings': properties.filter(is_active=True).count(),
            'pending_reservations': bookings.filter(payment_status='PENDING').count(),
            'upcoming_check_ins_this_week': upcoming_week,
            'earnings_this_month': completed_payments.aggregate(total=Sum('amount'))['total'] or 0,
            'unread_messages': 0,
            'unsupported_statuses': ['checked_in', 'completed'],
        })


class HostListingsView(HostQueryMixin, generics.ListAPIView):
    serializer_class = HostListingSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        return Property.objects.filter(host=self.request.user).prefetch_related('images').annotate(bookings_count=Count('bookings')).order_by('-created_at')


class HostReservationsView(HostQueryMixin, generics.ListAPIView):
    serializer_class = DashboardBookingSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        queryset = self.get_host_bookings()
        status_filter = self.request.query_params.get('status')
        today = timezone.localdate()
        if status_filter == 'pending':
            return queryset.filter(payment_status='PENDING')
        if status_filter == 'confirmed':
            return queryset.filter(payment_status='CONFIRMED', check_in_date__gte=today)
        if status_filter == 'completed':
            return queryset.filter(payment_status='COMPLETED')
        if status_filter == 'checked_in':
            return queryset.filter(payment_status='CHECKED_IN')
        return queryset


class HostEarningsView(HostQueryMixin, generics.ListAPIView):
    serializer_class = HostEarningSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        queryset = Payment.objects.filter(
            booking__property__host=self.request.user,
            status='COMPLETED',
        ).select_related('booking__property').order_by('-created_at')
        property_id = self.request.query_params.get('property_id')
        from_date = self.request.query_params.get('from')
        to_date = self.request.query_params.get('to')
        if property_id:
            queryset = queryset.filter(booking__property_id=property_id)
        if from_date:
            queryset = queryset.filter(created_at__date__gte=from_date)
        if to_date:
            queryset = queryset.filter(created_at__date__lte=to_date)
        return queryset
