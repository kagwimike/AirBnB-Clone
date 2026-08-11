from rest_framework import serializers
from .models import Property, PropertyImage, Amenity
from accounts.serializers import UserSerializer

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ('id', 'name', 'icon')

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'image_url', 'is_primary')

class PropertySerializer(serializers.ModelSerializer):
    # Nested serializers to include related data in a single API response
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    host = UserSerializer(read_only=True)
    
    # Allow writing amenity IDs when creating/updating a property
    amenity_ids = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, write_only=True, source='amenities'
    )

    class Meta:
        model = Property
        fields = (
            'id', 'host', 'title', 'description', 'property_type',
            'location', 'latitude', 'longitude', 'price_per_night',
            'max_guests', 'bedrooms', 'bathrooms', 'amenities', 'amenity_ids',
            'images', 'is_active', 'created_at'
        )
        read_only_fields = ('host', 'created_at')

    def create(self, validated_data):
        amenities = validated_data.pop('amenities', [])
        # Automatically assign the currently authenticated user as the host
        host = self.context['request'].user
        property_instance = Property.objects.create(host=host, **validated_data)
        property_instance.amenities.set(amenities)
        return property_instance