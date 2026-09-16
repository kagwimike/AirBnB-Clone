import api from "./api";

const dashboardService = {
  guestBookings: async (params = {}) =>
    (await api.get("dashboard/guest/bookings/", { params })).data,
  guestBookingDetail: async (id) =>
    (await api.get(`bookings/${id}/detail/`)).data,
  hostSummary: async () => (await api.get("dashboard/host/summary/")).data,
  hostListings: async (params = {}) =>
    (await api.get("dashboard/host/listings/", { params })).data,
  hostReservations: async (params = {}) =>
    (await api.get("dashboard/host/reservations/", { params })).data,
  hostEarnings: async (params = {}) =>
    (await api.get("dashboard/host/earnings/", { params })).data,
  transitionBooking: async (id, action) =>
    (await api.post(`bookings/${id}/host-transition/`, { action })).data,
  issues: async () => (await api.get("bookings/issues/")).data,
  reportIssue: async (booking, title, description) =>
    (await api.post("bookings/issues/", { booking, title, description })).data,
  resolveIssue: async (id, resolution) =>
    (await api.post(`bookings/issues/${id}/resolve/`, { resolution })).data,
  reviewGuest: async (booking, rating, comment) =>
    (await api.post("bookings/guest-reviews/", { booking, rating, comment }))
      .data,
};

export default dashboardService;
