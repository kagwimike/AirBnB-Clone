import React from 'react';

function HomesEmptyState({ onAddProperty }) {
  return (
    <div className="home__empty">
      <h2>No properties found</h2>

      <p>
        There are currently no properties available.
      </p>

      <button onClick={onAddProperty}>
        Add a Property
      </button>
    </div>
  );
}

export default HomesEmptyState;