from django.db import models
from django.conf import settings
import uuid

class Amenity(models.Model):
    name = models.CharField(max_length=50)
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name_plural = 'Amenities'

class Property(models.Model):
    class PropertyType(models.TextChoices):
        APARTMENT = 'APARTMENT', 'Apartment'
        VILLA = 'VILLA', 'Villa'
        HOUSE = 'HOUSE', 'House'
        CABIN = 'CABIN', 'Cabin'
        
    class Category(models.TextChoices):
        HOMES = 'HOMES', 'Homes'
        EXPERIENCES = 'EXPERIENCES', 'Experiences'
        SERVICES = 'SERVICES', 'Services'
        
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=255)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PropertyType.choices, default=PropertyType.APARTMENT)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.HOMES)
    
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    max_guests = models.PositiveIntegerField(default=1)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    house_rules = models.TextField(blank=True)
    check_in_instructions = models.TextField(blank=True)
    
    amenities = models.ManyToManyField(Amenity, related_name='properties', blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.location}"
        
    class Meta:
        verbose_name_plural = 'Properties'

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/', null=True, blank=True) 
    image_url = models.URLField(max_length=500, blank=True, null=True) 
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.property.title}"


class PropertyAvailability(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='availability')
    date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('property', 'date'), name='unique_property_availability_date')]
        ordering = ['date']


class Wishlist(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlists')
    name = models.CharField(max_length=100, default='My wishlist')
    properties = models.ManyToManyField(Property, related_name='wishlists', blank=True)
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} ({self.owner.email})'


class Review(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class ReviewImage(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='review_images/')
