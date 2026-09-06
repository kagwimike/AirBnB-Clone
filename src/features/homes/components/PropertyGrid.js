import React from 'react';
import PropertyCard from './PropertyCard';

function PropertyGrid({ properties, onSelectProperty }) {
  return (
    <section className="property-grid">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSelect={onSelectProperty}
        />
      ))}
    </section>
  );
}

export default PropertyGrid;