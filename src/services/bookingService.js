import axios from 'axios';

const PAYMENT_API_URL = 'http://127.0.0.1:8000/api/payments/';

const initializeMpesaCheckout = async (bookingData, contextToken) => {
  try {
    // 1. Locate the token from context or local storage
    let finalToken = contextToken || localStorage.getItem('access_token') || localStorage.getItem('access') || localStorage.getItem('token');
    
    if (!finalToken && localStorage.getItem('authTokens')) {
      const parsed = JSON.parse(localStorage.getItem('authTokens'));
      finalToken = parsed.access || parsed.token || parsed;
    }

    if (!finalToken) {
      throw new Error("No token found in context or local storage! The request will fail.");
    }

    // 2. Dispatch the payload to your Django payments endpoint
    const response = await axios.post(
      `${PAYMENT_API_URL}checkout/`,
      bookingData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${finalToken}`, 
        },
      }
    );
    return response.data;
  } catch (error) {
    // 3. ENHANCED LOGGING: This prints Django's exact validation error dictionary to your console
    console.error("Backend Validation Error Details:", error.response?.data || error.message);
    throw error;
  }
};

export default { initializeMpesaCheckout };