import React, { useState, useEffect } from 'react';
import './PropertyDetailModal.css';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { Button, Divider, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import bookingService from '../services/bookingService';

function PropertyDetailModal({ property, open, onClose }) {
  const { user } = useAuth(); // Pull in the authenticated user
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState('254'); // Default to Kenya country code
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (checkIn && checkOut && property?.price) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const timeDifference = end.getTime() - start.getTime();
      const nightCount = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
      if (nightCount > 0) {
        setNights(nightCount);
        const basePrice = parseFloat(property.price_per_night || property.price);
        setTotalPrice(nightCount * basePrice);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    }
  }, [checkIn, checkOut, property]);

  if (!open || !property) return null;

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    
    if (phone.length < 12 || !phone.startsWith('254')) {
      alert("Please enter a valid M-Pesa number starting with 254.");
      return;
    }

    setIsProcessing(true);
    
    const bookingData = {
      property_id: property.id,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests,
      total_price: totalPrice + (totalPrice * 0.1), // Base + Service Fee
      mpesa_phone: phone,
      email: user?.email || 'mikekagwi440@gmail.com' 
    };

    try {
      // Execute the POST request
      const response = await bookingService.initializeMpesaCheckout(bookingData, user?.token);
      
      // Handle the Daraja API response
      console.log("M-Pesa STK Push Initiated:", response);
      alert("M-Pesa prompt sent! Please check your phone to enter your PIN.");
      
      // Optional: Close modal and redirect to a "Trip Trips" dashboard
      onClose(); 
    } catch (error) {
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000";
  const rating = property.rating ? parseFloat(property.rating).toFixed(2) : "New";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <h1 className="modal-title">{property.title}</h1>
          
          <div className="modal-image-container">
            <img src={property.image_url || property.image || defaultImage} alt="Property" />
          </div>

          <div className="modal-layout">
            <div className="modal-details">
              <div className="modal-details-header">
                <h2>{property.category === 'HOMES' ? 'Entire home' : property.category} hosted by Professional</h2>
                <p>{property.max_guests || 2} guests · {property.bedrooms || 1} bedroom · {property.bathrooms || 1} bath</p>
              </div>
              
              <Divider sx={{ my: 3 }} />
              
              <div className="modal-description">
                <p>{property.description || "Experience the perfect getaway in this beautifully designed space. Featuring modern amenities, cozy interiors, and easy access to local attractions."}</p>
              </div>
            </div>

            <div className="modal-booking-widget">
              <div className="booking-card">
                <div className="booking-card-header">
                  <h3>${property.price_per_night || property.price} <span>night</span></h3>
                  <div className="booking-card-rating">
                    <StarIcon sx={{ fontSize: '16px' }} />
                    <span>{rating}</span>
                  </div>
                </div>

                <div className="booking-inputs">
                  <div className="date-inputs">
                    <div className="input-group border-right">
                      <label>CHECK-IN</label>
                      <input 
                        type="date" 
                        value={checkIn} 
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckIn(e.target.value)} 
                      />
                    </div>
                    <div className="input-group">
                      <label>CHECKOUT</label>
                      <input 
                        type="date" 
                        value={checkOut} 
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckOut(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="guest-input border-bottom">
                    <label>GUESTS</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={property.max_guests || 10} 
                      value={guests} 
                      onChange={(e) => setGuests(e.target.value)} 
                    />
                  </div>
                  {/* New M-Pesa Phone Input */}
                  <div className="guest-input">
                    <label>M-PESA NUMBER</label>
                    <input 
                      type="text" 
                      placeholder="2547XXXXXXXX"
                      maxLength="12"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Strips non-numeric chars
                    />
                  </div>
                </div>

                <Button 
                  variant="contained" 
                  fullWidth 
                  className="reserve-btn"
                  onClick={handleReserve}
                  disabled={isProcessing}
                >
                  {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Reserve with M-Pesa'}
                </Button>

                <p className="no-charge-text">You won't be charged until you enter your PIN</p>

                {nights > 0 && (
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>${property.price_per_night || property.price} x {nights} nights</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="price-row">
                      <span>Service fee</span>
                      <span>${(totalPrice * 0.1).toFixed(2)}</span>
                    </div>
                    <Divider sx={{ my: 2 }} />
                    <div className="price-row total">
                      <span>Total before taxes</span>
                      <span>${(totalPrice + (totalPrice * 0.1)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailModal;