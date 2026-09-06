from rest_framework import generics, permissions
from django.db.models import Q
from datetime import datetime
from .models import Property, Amenity, Wishlist, Review
from bookings.models import Booking
from .serializers import PropertySerializer, AmenitySerializer, WishlistSerializer, ReviewSerializer

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

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        property_type = self.request.query_params.get('property_type')
        bedrooms = self.request.query_params.get('bedrooms')

        try:
            if min_price:
                queryset = queryset.filter(price_per_night__gte=min_price)
            if max_price:
                queryset = queryset.filter(price_per_night__lte=max_price)
            if bedrooms:
                queryset = queryset.filter(bedrooms__gte=int(bedrooms))
            if property_type:
                queryset = queryset.filter(property_type__iexact=property_type)
        except ValueError:
            pass
                
        # Filter by Date Availability (Exclude properties with overlapping bookings)
        checkin = self.request.query_params.get('checkin')
        checkout = self.request.query_params.get('checkout')
        
        if checkin and checkout:
            try:
                requested_checkin = datetime.strptime(checkin, '%Y-%m-%d').date()
                requested_checkout = datetime.strptime(checkout, '%Y-%m-%d').date()
                if requested_checkout <= requested_checkin:
                    return queryset.none()

                # Find any bookings that intersect with the requested dates
                overlapping_bookings = Booking.objects.filter(
                    check_in_date__lt=requested_checkout,
                    check_out_date__gt=requested_checkin,
                    payment_status__in=['PENDING', 'CONFIRMED'],
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


class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(owner=self.request.user).prefetch_related('properties')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WishlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(owner=self.request.user).prefetch_related('properties')


class SharedWishlistView(generics.RetrieveAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'share_token'

    def get_queryset(self):
        return Wishlist.objects.filter(is_shared=True).prefetch_related('properties')


class PropertyReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()] if self.request.method == 'POST' else [permissions.AllowAny()]

    def get_queryset(self):
        return Review.objects.filter(property_id=self.kwargs['property_id']).select_related('guest').prefetch_related('images')

    def perform_create(self, serializer):
        booking = serializer.validated_data['booking']
        if booking.user != self.request.user or booking.property_id != int(self.kwargs['property_id']) or booking.payment_status != 'CONFIRMED':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only a guest with a confirmed stay can review this property.')
        serializer.save(guest=self.request.user, property_id=self.kwargs['property_id'])
