import axios from 'axios';

// Debug environment variables
console.log('Current environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL_LOCAL:', import.meta.env.VITE_API_BASE_URL_LOCAL);
console.log('VITE_API_BASE_URL_DEPLOY:', import.meta.env.VITE_API_BASE_URL_DEPLOY);

const isDevelopment = import.meta.env.MODE === 'development';
const myBaseUrl = isDevelopment 
  ? import.meta.env.VITE_API_BASE_URL_LOCAL 
  : import.meta.env.VITE_API_BASE_URL_DEPLOY || 'https://noteshub-66uw.onrender.com';

console.log('Using baseURL:', myBaseUrl);

const AxiosInstance = axios.create({
    baseURL: myBaseUrl,
    timeout: 10000, // Increased timeout for production
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    withCredentials: true, // Important for cookies/sessions
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Add a request interceptor
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(
          `${myBaseUrl}/token/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return AxiosInstance(originalRequest);
      } catch (error) {
        console.error('Refresh token failed:', error);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/Auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default AxiosInstance;