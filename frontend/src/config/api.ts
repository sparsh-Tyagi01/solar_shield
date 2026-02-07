/**
 * API Configuration
 * Centralized API URL configuration from environment variables
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

// API Endpoints
export const API = {
  // Current conditions and predictions
  currentConditions: `${API_BASE_URL}/api/current-conditions`,
  predictStorm: `${API_BASE_URL}/api/predict/storm`,
  predictImpact: `${API_BASE_URL}/predict/impact`,
  
  // Historical data
  historical: (timeRange: string) => `${API_BASE_URL}/api/historical/${timeRange}`,
  
  // Satellites
  satellites: `${API_BASE_URL}/api/satellites`,
  
  // Chatbot
  chatbot: `${API_BASE_URL}/api/chatbot`,
  
  // Economy loss
  economyLoss: `${API_BASE_URL}/api/economy-loss/current`,
  
  // Confidence and model improvement
  confidenceSummary: `${API_BASE_URL}/api/confidence/summary`,
  modelImprovementStatus: `${API_BASE_URL}/api/model-improvement/status`,
  
  // WebSocket
  websocket: `${WS_BASE_URL}/ws`,
};

export default API;
