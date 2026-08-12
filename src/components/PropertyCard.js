import React from 'react';
import './PropertyCard.css';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';

function PropertyCard({ property, onClick }) {
  // Fallback data handling in case some database fields are empty
  const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000";
  const imageUrl = property.image_url || property.image || defaultImage;
  const rating = property.rating ? parseFloat(property.rating).toFixed(2) : "New";

  return (
    <div className="property-card" onClick={onClick}>
      
      {/* Image Container */}
      <div className="property-card__image-container">
        <img 
          src={imageUrl} 
          alt={property.title || "Property"} 
          className="property-card__image"
        />
        <div className="property-card__favorite">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation(); // Prevents opening the modal when just liking the property
              // Add your wishlist logic here later
            }}
          >
            <FavoriteBorderIcon sx={{ color: 'white', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
          </IconButton>
        </div>
      </div>

      {/* Property Details */}
      <div className="property-card__info">
        <div className="property-card__header">
          <h3 className="property-card__location">
            {property.location || property.city || "Location unknown"}
          </h3>
          <div className="property-card__rating">
            <StarIcon sx={{ fontSize: '14px', mr: 0.5 }} />
            <span>{rating}</span>
          </div>
        </div>

        <p className="property-card__title">
          {property.title || "Beautiful Stay"}
        </p>
        
        <p className="property-card__host">
          {property.category === 'HOMES' ? 'Hosted by a professional' : `Category: ${property.category}`}
        </p>

        <div className="property-card__price-container">
          <span className="property-card__price">
            ${property.price_per_night || property.price}
          </span>
          <span className="property-card__price-label"> night</span>
        </div>
      </div>
      
    </div>
  );
}

export default PropertyCard;