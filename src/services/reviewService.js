import api from './api';

const reviewService = {
  create: async (propertyId, data) => {
    const payload = new FormData();
    payload.append('booking', data.bookingId);
    payload.append('rating', data.rating);
    payload.append('comment', data.comment);
    Array.from(data.photos || []).forEach((photo) => payload.append('image_uploads', photo));
    return (await api.post(`properties/${propertyId}/reviews/`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  list: async (propertyId) => (await api.get(`properties/${propertyId}/reviews/`)).data,
};

export default reviewService;
