import axios from "../components/AxiosInstance";


let refreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest.url.includes('/auth/');
    
    // If it's a 401 error and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      // If we're already trying to refresh the token, queue the request
      if (refreshing) {
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      refreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        
        // If no refresh token, redirect to login
        if (!refreshToken) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/Auth";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(
          "/token/refresh/",
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 200) {
          const { access, refresh } = response.data;
          
          // Update tokens in localStorage
          localStorage.setItem("access_token", access);
          if (refresh) {
            localStorage.setItem("refresh_token", refresh);
          }
          
          // Update the default authorization header
          axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
          
          // Update the original request header
          originalRequest.headers["Authorization"] = `Bearer ${access}`;
          
          // Process any queued requests
          onRefreshed(access);
          
          // Retry the original request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login on any error
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/Auth";
        return Promise.reject(refreshError);
      } finally {
        refreshing = false;
      }
    }
    
    // If the error is 401 and we've already retried, or it's an auth route
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/Auth";
    }

    return Promise.reject(error);
  }
);

// Add a request interceptor to add the auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
