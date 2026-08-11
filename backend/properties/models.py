from django.db import models
from django.conf import settings

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
        
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=255)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PropertyType.choices, default=PropertyType.APARTMENT)
    
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    max_guests = models.PositiveIntegerField(default=1)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    
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