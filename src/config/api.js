export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default {
  baseURL: API_BASE_URL,
  endpoints: {
    housing: `${API_BASE_URL}/api/housing`,
    roommates: `${API_BASE_URL}/api/roommates`,
    favorites: `${API_BASE_URL}/api/favorites`,
    profile: `${API_BASE_URL}/api/profile`
  }
}

