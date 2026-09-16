import api from "./api";

const propertyService = {
  // Fetch all active property listings (supports optional search parameters)
  getAllProperties: async (params = {}) => {
    const response = await api.get("properties/", { params });
    return response.data;
  },

  // Fetch single property details by ID
  getPropertyById: async (id) => {
    const response = await api.get(`properties/${id}/`);
    return response.data;
  },

  updateProperty: async (id, data) =>
    (await api.patch(`properties/${id}/`, data)).data,

  // Create a new property listing (Host only)
  createProperty: async (propertyData) => {
    const response = await api.post("properties/", propertyData);
    return response.data;
  },

  // Fetch available amenities list
  getAmenities: async () => {
    const response = await api.get("properties/amenities/");
    return response.data;
  },
};

export default propertyService;
