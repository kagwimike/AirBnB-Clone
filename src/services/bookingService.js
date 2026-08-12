import axios from 'axios';

const API_URL = 'http://localhost:8000/api/bookings/';

const initializeMpesaCheckout = async (bookingData, token) => {
  try {
    // Dispatch the payload to your Django endpoint
    const response = await axios.post(
      `${API_URL}checkout/`,
      bookingData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Assumes JWT or standard token auth
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Checkout failed:", error);
    throw error;
  }
};

export default { initializeMpesaCheckout };