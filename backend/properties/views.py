from rest_framework import generics, permissions
from .models import Property, Amenity
from .serializers import PropertySerializer, AmenitySerializer

class PropertyListCreateView(generics.ListCreateAPIView):
    queryset = Property.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = PropertySerializer

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