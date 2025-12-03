import axios from 'axios'

// Set base URL based on environment
let myBaseUrl = 'https://noteshub-back.onrender.com';

// In development, you can still use localhost if needed
if (import.meta.env.DEV) {
  myBaseUrl = import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:8000';
}

// Create axios instance
const AxiosInstance = axios.create({
    baseURL: myBaseUrl,
    timeout: 30000, // Increased to 30 seconds for production
    headers: {
        "Content-Type": "application/json",
        accept: "application/json"
    }
});

// Request interceptor - Add auth token to requests
AxiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');
        
        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh and errors
AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                
                if (refreshToken) {
                    // Try to refresh the access token
                    const response = await axios.post(
                        `${myBaseUrl}/api/token/refresh/`,
                        { refresh: refreshToken }
                    );

                    // Save new access token
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);
                    
                    // Update the authorization header
                    AxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // Retry the original request
                    return AxiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                
                // Redirect to login page
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            console.error('Permission denied');
        } else if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status >= 500) {
            console.error('Server error');
        }

        return Promise.reject(error);
    }
);

export default AxiosInstance;