import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropertyDetailModal from "../components/PropertyDetailModal";
import propertyService from "../services/propertyService";

function PropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    propertyService
      .getPropertyById(id)
      .then(setProperty)
      .catch(() => setError("This property could not be loaded."));
  }, [id]);
  if (error)
    return (
      <main className="home">
        <div className="home__message">
          <h2>Property unavailable</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  if (!property)
    return (
      <main className="home">
        <div className="home__loading">
          <div className="home__spinner" />
          <p>Loading property...</p>
        </div>
      </main>
    );
  return (
    <PropertyDetailModal
      property={property}
      open
      onClose={() => window.history.back()}
    />
  );
}
export default PropertyPage;
