import axios from 'axios';

// IMPORTANT: Backend URL should NOT end with /api
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://interior-backend-production.up.railway.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // API prefix added here
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const generateDesign = async (roomType, style, customPrompt) => {
  try {
    const response = await api.post('/generate-design', {
      room_type: roomType,
      style: style,
      custom_prompt: customPrompt,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getRooms = async () => {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getStyles = async () => {
  try {
    const response = await api.get('/styles');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy' };
  }
};

export default api;
