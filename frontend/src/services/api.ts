import axios from 'axios';

// Empty baseURL keeps local Vite proxy behavior.
// Set VITE_API_URL in hosted environments (for example, Vercel -> Render).
const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Setup response interceptors for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: User needs to login");
      // Handle redirect to login page logic here later
    }
    return Promise.reject(error);
  }
);
