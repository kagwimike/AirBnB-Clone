import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService';
import Button from '@mui/material/Button';
import './AddProperty.css';
import AmenitySelector from '../components/AmenitySelector';

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

  const [imageFiles, setImageFiles] = useState([]);

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
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'amenity_ids') {
          formData.amenity_ids.forEach((id) => dataPayload.append('amenity_ids', id));
        } else {
          dataPayload.append(key, formData[key]);
        }
      });

      imageFiles.forEach((file) => {
        dataPayload.append('uploaded_images', file);
      });

      await propertyService.createProperty(dataPayload);
      navigate('/');
    } catch (err) {
      console.error('Property creation error:', err.response?.data || err);
      setError('Failed to create property. Ensure you are logged in as a Host and all fields are valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-split-container">
      
      {/* LEFT SIDE: Scrolling Form */}
      <div className="add-property-form-side">
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

            <div className="form-group">
              <label>Upload Property Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
            </div>

            {/* Interactive Amenities Grid Section from your Component */}
            <div className="form-group">
              <label>Amenities</label>
              <AmenitySelector
                amenities={amenitiesList}
                selectedAmenities={formData.amenity_ids}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    amenity_ids: selected,
                  }))
                }
              />
            </div>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              style={{ backgroundColor: '#ff7779', color: 'white', marginTop: '20px', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
            >
              {loading ? 'Publishing Listing...' : 'Publish Listing'}
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: 3D Rotating Images */}
      <div className="add-property-image-side">
        <div className="image-overlay-text">
          <h1>Open your door to hosting</h1>
          <p>Join thousands of hosts earning extra income by sharing their space.</p>
        </div>
        
        <div className="scene3d">
          <div className="carousel3d">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80" alt="Villa" />
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80" alt="Mansion" />
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80" alt="Apartment" />
            <img src="https://images.unsplash.com/photo-1502672260266-1c1e52416453?w=600&auto=format&fit=crop&q=80" alt="Bedroom" />
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80" alt="Living Room" />
          </div>
        </div>
      </div>

    </div>
  );
}

export default AddProperty;