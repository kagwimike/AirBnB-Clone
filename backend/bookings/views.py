from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Booking, GuestReview, Issue
from .models import Conversation, Message, Notification
from .serializers import BookingSerializer, ConversationSerializer, MessageSerializer, NotificationSerializer, GuestReviewSerializer, IssueSerializer

class BookingListView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookingCancelView(generics.UpdateAPIView):
    """Allow a guest to cancel only their own pending or confirmed booking."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def post(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.payment_status not in ('PENDING', 'CONFIRMED'):
            return Response(
                {'detail': 'Only pending or confirmed bookings can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.payment_status = 'CANCELLED'
        booking.save(update_fields=['payment_status'])
        return Response(self.get_serializer(booking).data, status=status.HTTP_200_OK)


class HostBookingTransitionView(generics.GenericAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, property__host=request.user)
        action = request.data.get('action')
        transitions = {'check_in': ('CONFIRMED', 'CHECKED_IN'), 'checkout': ('CHECKED_IN', 'COMPLETED')}
        if action not in transitions:
            return Response({'detail': 'Use check_in or checkout.'}, status=status.HTTP_400_BAD_REQUEST)
        expected, next_status = transitions[action]
        if booking.payment_status != expected:
            return Response({'detail': f'Booking must be {expected} before {action}.'}, status=status.HTTP_409_CONFLICT)
        booking.payment_status = next_status
        booking.save(update_fields=['payment_status'])
        Notification.objects.create(user=booking.user, title='Booking updated', body=f'Your booking is now {next_status.replace("_", " ").lower()}.', link=f'/bookings/{booking.id}')
        return Response(BookingSerializer(booking, context={'request': request}).data)


class IssueListCreateView(generics.ListCreateAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(booking__user=self.request.user) | Issue.objects.filter(booking__property__host=self.request.user)

    def perform_create(self, serializer):
        booking = get_object_or_404(Booking, pk=self.request.data.get('booking'))
        if booking.user != self.request.user and booking.property.host != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not part of this booking.')
        serializer.save(reporter=self.request.user, booking=booking)


class IssueResolveView(generics.GenericAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        issue = get_object_or_404(Issue, pk=pk, booking__property__host=request.user)
        issue.status = 'RESOLVED'
        issue.resolution = request.data.get('resolution', '').strip()
        issue.resolved_at = timezone.now()
        issue.save(update_fields=['status', 'resolution', 'resolved_at'])
        Notification.objects.create(user=issue.reporter, title='Issue resolved', body=issue.resolution or 'Your host resolved the reported issue.', link=f'/bookings/{issue.booking_id}')
        return Response(self.get_serializer(issue).data)


class GuestReviewCreateView(generics.CreateAPIView):
    serializer_class = GuestReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = get_object_or_404(Booking, pk=self.request.data.get('booking'), property__host=self.request.user, payment_status='COMPLETED')
        serializer.save(booking=booking, host=self.request.user, guest=booking.user)


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        booking = Booking.objects.get(pk=self.kwargs['booking_id'])
        if booking.user != self.request.user and booking.property.host != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a participant in this conversation.')
        conversation, _ = Conversation.objects.get_or_create(booking=booking, guest=booking.user, host=booking.property.host)
        conversation.messages.exclude(sender=self.request.user).filter(read_at__isnull=True).update(read_at=timezone.now())
        return conversation


class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation = Conversation.objects.get(pk=self.kwargs['conversation_id'])
        if self.request.user not in (conversation.guest, conversation.host):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a participant in this conversation.')
        if not serializer.validated_data.get('body') and not serializer.validated_data.get('attachment'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Write a message or attach a file.')
        message = serializer.save(conversation=conversation, sender=self.request.user)
        recipient = conversation.host if message.sender == conversation.guest else conversation.guest
        Notification.objects.create(user=recipient, title='New message', body=message.body or 'Sent an attachment', link=f'/bookings/{conversation.booking_id}/messages/')


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(self.get_serializer(notification).data)
