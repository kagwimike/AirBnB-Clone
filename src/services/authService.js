import api from "./api";

const authService = {
  // Register a new user (Guest or Host)
  register: async (userData) => {
    const response = await api.post("auth/register/", userData);
    return response.data;
  },

  // Log in an existing user and store tokens
  login: async (credentials) => {
    const response = await api.post("auth/login/", credentials);
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Log out by clearing local storage
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  // Fetch currently logged-in user profile
  getProfile: async () => {
    const response = await api.get("auth/profile/");
    return response.data;
  },

  setMode: async (mode) => {
    const response = await api.post("auth/mode/", { mode });
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  },

  // Get currently stored user object
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  },
};

export default authService;
