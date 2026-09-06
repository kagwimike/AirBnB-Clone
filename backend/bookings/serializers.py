from rest_framework import serializers
from .models import Booking
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
