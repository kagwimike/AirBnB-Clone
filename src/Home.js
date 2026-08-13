import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropertyDetailModal from './components/PropertyDetailModal'; 
import './Home.css';

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==================================
  // MODAL STATE
  // ==================================
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const location = searchParams.get('location');
  const guests = searchParams.get('guests');

  // ==================================
  // FETCH PROPERTIES
  // ==================================
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        let url = 'http://127.0.0.1:8000/api/properties/';
        const params = new URLSearchParams();

        if (location) {
          params.append('location', location);
        }

        if (guests) {
          params.append('guests', guests);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        console.log('Properties from backend:', data);

        if (Array.isArray(data)) {
          setProperties(data);
        } else if (data.results) {
          setProperties(data.results);
        } else {
          setProperties([]);
        }

      } catch (err) {
        console.error(err);
        setError(
          'Unable to load properties. Make sure the Django server is running.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location, guests]);

  // ==================================
  // HANDLERS
  // ==================================
  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  // ==================================
  // LOADING
  // ==================================
  if (loading) {
    return (
      <div className="home__loading">
        <div className="home__spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  // ==================================
  // ERROR
  // ==================================
  if (error) {
    return (
      <div className="home__message">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main className="home">

      {/* ==================================
          PAGE TITLE
      ================================== */}
      <section className="home__heading">
        {location ? (
          <>
            <h1>Stays in {location}</h1>
            <p>Explore available properties in {location}</p>
          </>
        ) : (
          <>
            <h1>Explore stays</h1>
            <p>Find places to stay around the world</p>
          </>
        )}
      </section>

      {/* ==================================
          NO PROPERTIES
      ================================== */}
      {properties.length === 0 ? (
        <div className="home__empty">
          <h2>No properties found</h2>
          <p>There are currently no properties available.</p>
          <button onClick={() => navigate('/add-property')}>
            Add a Property
          </button>
        </div>
      ) : (

        /* ==================================
            PROPERTY GRID
        ================================== */
        <section className="property-grid">
          {properties.map((property) => (
            <article
              className="property-card"
              key={property.id}
              onClick={() => handlePropertyClick(property)} // Open Modal Instead of Navigating
            >

              {/* IMAGE */}
              <div className="property-card__image-container">
                <img
                  src={
                    property.image ||
                    property.image_url ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945'
                  }
                  alt={property.title}
                  className="property-card__image"
                />
              </div>

              {/* DETAILS */}
              <div className="property-card__content">
                <h2>{property.title}</h2>

                <p className="property-card__location">
                  {property.location ||
                    property.city ||
                    'Location not specified'}
                </p>

                <p className="property-card__description">
                  {property.description
                    ? property.description.substring(0, 100)
                    : 'Beautiful property available for your stay.'}
                </p>

                {/* PRICE */}
                <div className="property-card__price">
                  <strong>
                    KES {Number(property.price_per_night || property.price || 0).toLocaleString()}
                  </strong>
                  <span> night</span>
                </div>
              </div>

            </article>
          ))}
        </section>
      )}

      {/* ==================================
          PROPERTY DETAIL MODAL
      ================================== */}
      <PropertyDetailModal 
        property={selectedProperty} 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </main>
  );
}

export default Home;