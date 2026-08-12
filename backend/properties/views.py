from rest_framework import generics, permissions
from django.db.models import Q
from datetime import datetime
from .models import Property, Amenity
from .serializers import PropertySerializer, AmenitySerializer

class PropertyListCreateView(generics.ListCreateAPIView):
    serializer_class = PropertySerializer

    def get_queryset(self):
        queryset = Property.objects.filter(is_active=True).order_by('-created_at')
        
        # Filter by Category (Homes, Experiences, Services)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)
            
        # Filter by Location or Title keyword search
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(
                Q(location__icontains=location) | Q(title__icontains=location)
            )
            
        # Filter by Minimum Guest Capacity
        guests = self.request.query_params.get('guests')
        if guests:
            try:
                queryset = queryset.filter(max_guests__gte=int(guests))
            except ValueError:
                pass
                
        # Filter by Date Availability (Exclude properties with overlapping bookings)
        checkin = self.request.query_params.get('checkin')
        checkout = self.request.query_params.get('checkout')
        
        if checkin and checkout:
            try:
                requested_checkin = datetime.strptime(checkin, '%Y-%m-%d').date()
                requested_checkout = datetime.strptime(checkout, '%Y-%m-%d').date()

                # Find any bookings that intersect with the requested dates
                overlapping_bookings = Booking.objects.filter(
                    check_in_date__lt=requested_checkout,
                    check_out_date__gt=requested_checkin,
                    # Optional: status='CONFIRMED' (Uncomment if you track booking states)
                )

                # Extract the IDs of properties that are currently booked
                booked_property_ids = overlapping_bookings.values_list('property_id', flat=True)

                # Exclude the booked properties from the available queryset
                queryset = queryset.exclude(id__in=booked_property_ids)
            except ValueError:
                pass # Fail gracefully if dates are malformed in the URL
                
        return queryset

    def get_permissions(self):
        # Anyone can view properties (GET), but only authenticated hosts can create them (POST)
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_permissions(self):
        # Public users can view details, but only owners/admins can update/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class AmenityListView(generics.ListAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [permissions.AllowAny]