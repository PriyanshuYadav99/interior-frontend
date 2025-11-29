import axios from 'axios';

// ✅ FIXED: Use Railway URL - REMOVE the /api here since we add it below
const API_BASE_URL = 'https://interior-backend-production.up.railway.app';

console.log('[API] Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ FIXED: Use Railway URL for generate-design
export const generateDesign = async (roomType, style, customPrompt, clientName = 'skyline') => {
  console.log('[API] generateDesign called with:', { roomType, style, customPrompt, clientName });
  console.log('[API] Fetching from:', `${API_BASE_URL}/api/generate-design`);
  
  const response = await fetch(`${API_BASE_URL}/api/generate-design`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      room_type: roomType,
      style: style,
      custom_prompt: customPrompt,
      client_name: clientName
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[API] Generation failed:', errorData);
    throw new Error(errorData.error || 'Generation failed');
  }

  const result = await response.json();
  console.log('[API] Generation response:', result);
  return result;
};

// ✅ NEW: Export checkSession function
export const checkSession = async (sessionId) => {
  console.log('[API] checkSession called with:', sessionId);
  console.log('[API] Fetching from:', `${API_BASE_URL}/api/check-session`);
  
  const response = await fetch(`${API_BASE_URL}/api/check-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    console.error('[API] Check session failed:', response.status);
    throw new Error('Failed to check session');
  }

  const result = await response.json();
  console.log('[API] Check session response:', result);
  return result;
};

// ✅ NEW: Export incrementGeneration function
export const incrementGeneration = async (sessionId, roomType, style, customPrompt) => {
  console.log('[API] incrementGeneration called');
  console.log('[API] Fetching from:', `${API_BASE_URL}/api/increment-generation`);
  
  const response = await fetch(`${API_BASE_URL}/api/increment-generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      room_type: roomType,
      style: style,
      custom_prompt: customPrompt
    }),
  });

  if (!response.ok) {
    console.error('[API] Increment generation failed:', response.status);
    throw new Error('Failed to increment generation count');
  }

  const result = await response.json();
  console.log('[API] Increment generation response:', result);
  return result;
};

export const getRooms = async () => {
  try {
    console.log('[API] getRooms called');
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    console.error('[API] getRooms error:', error);
    throw error;
  }
};

export const getStyles = async () => {
  try {
    console.log('[API] getStyles called');
    const response = await api.get('/styles');
    return response.data;
  } catch (error) {
    console.error('[API] getStyles error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    console.log('[API] checkHealth called');
    console.log('[API] Calling:', `${API_BASE_URL}/api/health`);
    const response = await api.get('/health');
    console.log('[API] Health response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return { status: 'unhealthy' };
  }
};

export default api;