from rest_framework import serializers
from .models import Property, PropertyImage, PropertyAvailability, Amenity, Wishlist, Review, ReviewImage
from accounts.serializers import UserSerializer

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ('id', 'name', 'icon')

class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'image_url', 'is_primary')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_url(obj.image.url) if request else obj.image.url
        return obj.image_url


class PropertyAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyAvailability
        fields = ('id', 'date', 'price', 'is_available')

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    host = UserSerializer(read_only=True)
    
    # Accept amenity primary keys from the frontend form
    amenity_ids = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, write_only=True, source='amenities', required=False
    )

    class Meta:
        model = Property
        fields = (
            'id', 'host', 'title', 'description', 'property_type',
            'location', 'latitude', 'longitude', 'price_per_night',
            'max_guests', 'bedrooms', 'bathrooms', 'house_rules', 'check_in_instructions', 'amenities', 'amenity_ids',
            'images', 'is_active', 'created_at'
        )
        read_only_fields = ('host', 'created_at')

    def create(self, validated_data):
        amenities = validated_data.pop('amenities', [])
        host = self.context['request'].user
        
        # Create property instance
        property_instance = Property.objects.create(host=host, **validated_data)
        
        # Assign amenities
        if amenities:
            property_instance.amenities.set(amenities)
            
        # Handle uploaded images if sent via multipart/form-data
        request = self.context.get('request')
        if request and 'uploaded_images' in request.FILES:
            uploaded_files = request.FILES.getlist('uploaded_images')
            for index, file in enumerate(uploaded_files):
                PropertyImage.objects.create(
                    property=property_instance,
                    image=file,
                    is_primary=(index == 0) # Make first uploaded image primary
                )

        return property_instance


class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ('id', 'image')


class ReviewSerializer(serializers.ModelSerializer):
    guest = UserSerializer(read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)
    image_uploads = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)

    class Meta:
        model = Review
        fields = ('id', 'property', 'booking', 'guest', 'rating', 'comment', 'images', 'image_uploads', 'created_at')
        read_only_fields = ('property', 'guest')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        uploads = validated_data.pop('image_uploads', [])
        review = Review.objects.create(**validated_data)
        for image in uploads:
            ReviewImage.objects.create(review=review, image=image)
        return review


class WishlistSerializer(serializers.ModelSerializer):
    properties = PropertySerializer(many=True, read_only=True)
    property_ids = serializers.PrimaryKeyRelatedField(source='properties', queryset=Property.objects.all(), many=True, write_only=True, required=False)
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ('id', 'name', 'properties', 'property_ids', 'is_shared', 'share_token', 'share_url', 'created_at')
        read_only_fields = ('share_token',)

    def get_share_url(self, obj):
        return f'/wishlists/shared/{obj.share_token}/' if obj.is_shared else None
