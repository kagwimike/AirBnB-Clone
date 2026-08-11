import React, { useState, useEffect } from 'react';
import './Home.css';
import './Banner.css';
import Banner from './Banner';
import PropertyCard from './components/PropertyCard';
import PropertyDetailModal from './components/PropertyDetailModal';
import propertyService from './services/propertyService';

function Home() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch properties from Django backend on load
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyService.getAllProperties();
        setProperties(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleCardClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="home">
      <Banner />

      <div className="home__section">
        <h2 className="home__section-title">Explore Stays</h2>
        
        {loading ? (
          <p className="home__message">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="home__message">No properties available yet. Log in as a host to add one!</p>
        ) : (
          <div className="home__grid">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => handleCardClick(property)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      <PropertyDetailModal 
        property={selectedProperty} 
        open={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}

export default Home;