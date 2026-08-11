import React from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import './PropertyDetailModal.css';

function PropertyDetailModal({ property, open, onClose }) {
  if (!property) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className="property-modal">
      <div className="property-modal__container">
        <button className="property-modal__close" onClick={onClose}>
          <CloseIcon />
        </button>

        <h2>{property.title}</h2>
        <p className="property-modal__location">{property.location}</p>

        {/* Image Grid */}
        <div className="property-modal__grid">
          {property.images && property.images.length > 0 ? (
            property.images.map((img, index) => (
              <img key={index} src={img.image || img.image_url} alt={`Listing ${index}`} />
            ))
          ) : (
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" alt="Fallback" />
          )}
        </div>

        <div className="property-modal__body">
          <div className="property-modal__details">
            <h3>Hosted by {property.host?.first_name || property.host?.email || 'Airbnb Host'}</h3>
            <p>{property.max_guests} guests · {property.bedrooms} bedrooms · {property.bathrooms} baths</p>
            <hr />
            <p className="property-modal__desc">{property.description}</p>
            
            <h4>Amenities</h4>
            <ul className="property-modal__amenities">
              {property.amenities?.map((amenity) => (
                <li key={amenity.id}>{amenity.name}</li>
              ))}
            </ul>
          </div>

          <div className="property-modal__booking-box">
            <div className="price-tag">
              <strong>${property.price_per_night}</strong> / night
            </div>
            <Button variant="contained" color="primary" fullWidth>
              Reserve
            </Button>
            <p className="note">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default PropertyDetailModal;