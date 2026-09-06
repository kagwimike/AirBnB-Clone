from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Booking
from .models import Conversation, Message, Notification
from .serializers import BookingSerializer, ConversationSerializer, MessageSerializer, NotificationSerializer

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
