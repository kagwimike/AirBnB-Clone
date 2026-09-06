const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const getHomes = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });

  const queryString = params.toString();

  const url = `${API_BASE_URL}/api/properties/${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

const homesService = {
  getHomes,
};

export default homesService;
