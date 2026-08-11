from django.urls import path
from .views import PropertyListCreateView, PropertyDetailView, AmenityListView

urlpatterns = [
    path('', PropertyListCreateView.as_view(), name='property-list-create'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('amenities/', AmenityListView.as_view(), name='amenity-list'),
]