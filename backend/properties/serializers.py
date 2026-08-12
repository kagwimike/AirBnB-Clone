from rest_framework import serializers
from .models import Property, PropertyImage, Amenity
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
            'max_guests', 'bedrooms', 'bathrooms', 'amenities', 'amenity_ids',
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