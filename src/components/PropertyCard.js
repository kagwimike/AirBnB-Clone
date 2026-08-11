import React from 'react';
import './PropertyCard.css';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';

function PropertyCard({ property, onClick }) {
  // Grab the primary image or fallback to a default stock image
  const primaryImage = property.images && property.images.length > 0
    ? (property.images.find(img => img.is_primary)?.image || property.images[0].image || property.images[0].image_url)
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-card__image-container">
        <img src={primaryImage} alt={property.title} />
      </div>
      <div className="property-card__info">
        <div className="property-card__header">
          <h3>{property.location}</h3>
          <p className="property-card__rating">
            <StarRateRoundedIcon /> 4.98
          </p>
        </div>
        <p className="property-card__subtitle">{property.property_type}</p>
        <p className="property-card__price">
          <strong>${property.price_per_night}</strong> night
        </p>
      </div>
    </div>
  );
}

export default PropertyCard;