from django.urls import path
from .views import PropertyListCreateView, PropertyDetailView, AmenityListView, WishlistListCreateView, WishlistDetailView, SharedWishlistView, PropertyReviewListCreateView

urlpatterns = [
    path('', PropertyListCreateView.as_view(), name='property-list-create'),
    path('amenities/', AmenityListView.as_view(), name='amenity-list'),
    path('wishlists/', WishlistListCreateView.as_view(), name='wishlist-list'),
    path('wishlists/<int:pk>/', WishlistDetailView.as_view(), name='wishlist-detail'),
    path('wishlists/shared/<uuid:share_token>/', SharedWishlistView.as_view(), name='wishlist-shared'),
    path('<int:property_id>/reviews/', PropertyReviewListCreateView.as_view(), name='property-reviews'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
]
