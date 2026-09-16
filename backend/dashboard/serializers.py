from rest_framework import serializers

from bookings.models import Booking
from payments.models import Payment
from properties.models import Property
from properties.serializers import PropertySerializer


class DashboardBookingSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    guest = serializers.SerializerMethodField()
    host = serializers.SerializerMethodField()
    review_exists = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'property', 'guest', 'host', 'check_in_date',
            'check_out_date', 'guests', 'total_price', 'payment_status',
            'mpesa_receipt', 'created_at', 'review_exists',
        )

    def get_guest(self, obj):
        return self._user_summary(obj.user)

    def get_host(self, obj):
        return self._user_summary(obj.property.host)

    def get_review_exists(self, obj):
        return hasattr(obj, 'review')

    @staticmethod
    def _user_summary(user):
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone_number': user.phone_number,
        }


class HostListingSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    bookings_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Property
        fields = ('id', 'title', 'location', 'price_per_night', 'is_active', 'status', 'image', 'bookings_count')

    def get_status(self, obj):
        return 'published' if obj.is_active else 'unpublished'

    def get_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not image:
            return None
        request = self.context.get('request')
        if image.image:
            return request.build_absolute_uri(image.image.url) if request else image.image.url
        return image.image_url


class HostEarningSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking_id', read_only=True)
    property_title = serializers.CharField(source='booking.property.title', read_only=True)
    gross = serializers.DecimalField(source='amount', max_digits=10, decimal_places=2, read_only=True)
    platform_fee = serializers.SerializerMethodField()
    net = serializers.DecimalField(source='amount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'booking_id', 'property_title', 'gross', 'platform_fee', 'net', 'status', 'created_at')

    def get_platform_fee(self, obj):
        return 0
