import React, { useEffect, useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../../../context/AuthContext';
import wishlistService from '../../../services/wishlistService';

function PropertyCard({ property, onSelect }) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistService.list()
      .then((lists) => setIsFavorite(lists.some((list) => list.properties.some((item) => item.id === property.id))))
      .catch(() => setIsFavorite(false));
  }, [isAuthenticated, property.id]);
  const image =
    property.image ||
    property.image_url ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945';

  const price = Number(
    property.price_per_night || property.price || 0
  );

  const location =
    property.location ||
    property.city ||
    'Location not specified';

  const description =
    property.description ||
    'Beautiful property available for your stay.';

  const toggleFavorite = async (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      window.alert('Please log in to save a stay.');
      return;
    }
    try {
      setSavingFavorite(true);
      const wishlist = await wishlistService.toggleProperty(property);
      setIsFavorite(wishlist.properties.some((item) => item.id === property.id));
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <article
      className="property-card"
      onClick={() => onSelect(property)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onSelect(property);
        }
      }}
    >
      <div className="property-card__image-container">
        <button
          className={`property-card__favorite ${isFavorite ? 'is-favorite' : ''}`}
          type="button"
          onClick={toggleFavorite}
          disabled={savingFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </button>
        <img
          src={image}
          alt={property.title || 'Property'}
          className="property-card__image"
        />
      </div>

      <div className="property-card__content">
        <h2>
          {property.title || 'Untitled property'}
        </h2>

        <p className="property-card__location">
          {location}
        </p>

        <p className="property-card__description">
          {description.substring(0, 100)}
        </p>

        <div className="property-card__price">
          <strong>
            KES {price.toLocaleString()}
          </strong>

          <span> night</span>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
