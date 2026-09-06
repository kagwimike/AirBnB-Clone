import api from './api';

const messagingService = {
  conversation: async (bookingId) => (await api.get(`bookings/${bookingId}/conversation/`)).data,
  send: async (conversationId, body, attachment) => {
    const payload = new FormData();
    if (body) payload.append('body', body);
    if (attachment) payload.append('attachment', attachment);
    return (await api.post(`bookings/conversations/${conversationId}/messages/`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  notifications: async () => (await api.get('bookings/notifications/')).data,
  markRead: async (id) => (await api.patch(`bookings/notifications/${id}/read/`)).data,
};

export default messagingService;
