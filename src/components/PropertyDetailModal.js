import React, { useState, useEffect } from 'react';
import './PropertyDetailModal.css';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { Button, Divider, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

function PropertyDetailModal({ property, open, onClose }) {
  const { user, token, authTokens } = useAuth(); 
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState('254'); 
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Robust base price extraction supporting multiple backend property naming conventions
  const basePrice = parseFloat(property?.price_per_night || property?.price || property?.cost || 50);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const timeDifference = end.getTime() - start.getTime();
      const nightCount = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
      if (nightCount > 0) {
        setNights(nightCount);
        setTotalPrice(nightCount * basePrice);
      } else {
        setNights(1);
        setTotalPrice(basePrice);
      }
    } else {
      setNights(1);
      setTotalPrice(basePrice);
    }
  }, [checkIn, checkOut, basePrice]);

  if (!open || !property) return null;

  const handleReserve = async () => {
    if (!user) {
      alert("Please log in to make a reservation.");
      return;
    }

    // Default dates fallback if fields were left blank
    const effectiveCheckIn = checkIn || new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const effectiveCheckOut = checkOut || tomorrow.toISOString().split("T")[0];
    
    if (phone.length < 12 || !phone.startsWith('254')) {
      alert("Please enter a valid M-Pesa number starting with 254.");
      return;
    }

    setIsProcessing(true);
    
    const calculatedBase = totalPrice > 0 ? totalPrice : basePrice;
    const finalTotalWithTax = calculatedBase + (calculatedBase * 0.1);
    
    const bookingData = {
      property_id: Number(property.id || 1),
      check_in: effectiveCheckIn,
      check_out: effectiveCheckOut,
      guests: parseInt(guests, 10) || 1,
      total_price: parseFloat(finalTotalWithTax.toFixed(2)),
      mpesa_phone: phone,
      email: user.email 
    };

    console.log("OUTGOING BOOKING PAYLOAD:", bookingData);

    try {
      let activeToken = token || (authTokens && authTokens.access) || localStorage.getItem('access_token') || localStorage.getItem('access') || localStorage.getItem('token');
      
      if (!activeToken && localStorage.getItem('authTokens')) {
        const parsedTokens = JSON.parse(localStorage.getItem('authTokens'));
        activeToken = parsedTokens.access || parsedTokens;
      }

      console.log("Dispatching with Token:", activeToken);

      const response = await bookingService.initializeMpesaCheckout(bookingData, activeToken);
      
      console.log("M-Pesa STK Push Initiated:", response);
      alert("M-Pesa prompt sent! Please check your phone to enter your PIN.");
      
      onClose(); 
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Failed to initiate payment. Check console for details.");
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
                <h2>{property.category === 'HOMES' ? 'Entire home' : (property.category || 'Apartment')} hosted by Professional</h2>
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
                  <h3>${basePrice} <span>night</span></h3>
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
                  <div className="guest-input">
                    <label>M-PESA NUMBER</label>
                    <input 
                      type="text" 
                      placeholder="2547XXXXXXXX"
                      maxLength="12"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
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
                      <span>${basePrice} x {nights} nights</span>
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