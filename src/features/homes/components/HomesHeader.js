import React from 'react';

function HomesHeader({ location }) {
  return (
    <section className="home__heading">
      {location ? (
        <>
          <h1>Stays in {location}</h1>
          <p>
            Explore available properties in {location}
          </p>
        </>
      ) : (
        <>
          <h1>Explore stays</h1>
          <p>
            Find places to stay around the world
          </p>
        </>
      )}
    </section>
  );
}

export default HomesHeader;