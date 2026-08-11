import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService';
import Button from '@mui/material/Button';
import './AddProperty.css';

function AddProperty() {
  const navigate = useNavigate();
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'APARTMENT',
    location: '',
    price_per_night: '',
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1.0,
    amenity_ids: []
  });

  // State to hold selected image files for upload
  const [imageFiles, setImageFiles] = useState([]);

  // Fetch amenities on mount so hosts can select them
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await propertyService.getAmenities();
        setAmenitiesList(data);
      } catch (err) {
        console.error('Failed to load amenities:', err);
      }
    };
    fetchAmenities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    // Capture multiple image files selected by the host
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleAmenityToggle = (amenityId) => {
    const currentAmenities = [...formData.amenity_ids];
    if (currentAmenities.includes(amenityId)) {
      setFormData({
        ...formData,
        amenity_ids: currentAmenities.filter((id) => id !== amenityId)
      });
    } else {
      setFormData({
        ...formData,
        amenity_ids: [...currentAmenities, amenityId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use FormData to support multipart file uploads alongside text fields
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'amenity_ids') {
          formData.amenity_ids.forEach((id) => dataPayload.append('amenity_ids', id));
        } else {
          dataPayload.append(key, formData[key]);
        }
      });

      // Append each selected image file
      imageFiles.forEach((file) => {
        dataPayload.append('uploaded_images', file);
      });

      await propertyService.createProperty(dataPayload);
      navigate('/'); // Redirect to home after successful listing creation
    } catch (err) {
      console.error('Property creation error:', err.response?.data || err);
      setError('Failed to create property. Ensure you are logged in as a Host and all fields are filled correctly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-container">
      <div className="add-property-card">
        <h2>List Your Property on Airbnb</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Luxury Nairobi Skyline Apartment"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Property Type</label>
              <select name="property_type" value={formData.property_type} onChange={handleChange}>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="HOUSE">House</option>
                <option value="CABIN">Cabin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location (City / Region)</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Nairobi, Kenya"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price per Night ($)</label>
              <input
                type="number"
                name="price_per_night"
                placeholder="120"
                min="1"
                step="0.01"
                value={formData.price_per_night}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Max Guests</label>
              <input
                type="number"
                name="max_guests"
                min="1"
                value={formData.max_guests}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                min="0.5"
                step="0.5"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe what makes your place special..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* New Image Upload Field */}
          <div className="form-group">
            <label>Upload Property Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <small style={{ color: '#717171', display: 'block', marginTop: '4px' }}>
              Select one or more photos of your space.
            </small>
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <div className="amenities-grid">
              {amenitiesList.map((amenity) => (
                <label key={amenity.id} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.amenity_ids.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <span>{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? 'Publishing Listing...' : 'Publish Listing'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;