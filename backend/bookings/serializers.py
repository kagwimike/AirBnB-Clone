from rest_framework import serializers
from .models import Booking, GuestReview, Issue
from properties.models import Property
from properties.serializers import PropertySerializer
from .models import Conversation, Message, Notification

class BookingSerializer(serializers.ModelSerializer):
    # Keep list responses useful to the guest dashboard without changing how
    # booking creation accepts a property primary key.
    property = PropertySerializer(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        source='property', queryset=Property.objects.all(), write_only=True
    )

    class Meta:
        model = Booking
        fields = (
            'id', 'user', 'property', 'property_id', 'check_in_date',
            'check_out_date', 'guests', 'total_price', 'payment_status',
            'mpesa_receipt', 'created_at',
        )
        read_only_fields = ['user', 'payment_status', 'mpesa_receipt', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'sender', 'sender_name', 'body', 'attachment', 'created_at', 'read_at')
        read_only_fields = ('sender', 'created_at', 'read_at')

    def get_sender_name(self, obj):
        return obj.sender.first_name or obj.sender.email


class ConversationSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ('id', 'booking_id', 'guest', 'host', 'updated_at', 'messages')
        read_only_fields = ('guest', 'host', 'updated_at')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'body', 'link', 'is_read', 'created_at')


class IssueSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.first_name', read_only=True)

    class Meta:
        model = Issue
        fields = ('id', 'booking', 'reporter', 'reporter_name', 'title', 'description', 'status', 'resolution', 'created_at', 'resolved_at')
        read_only_fields = ('reporter', 'status', 'resolution', 'created_at', 'resolved_at')


class GuestReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestReview
        fields = ('id', 'booking', 'host', 'guest', 'rating', 'comment', 'created_at')
        read_only_fields = ('host', 'guest', 'created_at')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
