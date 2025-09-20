import axios from "axios";

let refreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshing) {
        // If a refresh is already happening, queue the request
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            resolve(axios.request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      refreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/Auth";
          return Promise.reject(error);
        }

        const response = await axios.post(
          "http://127.0.0.1:8000/token/refresh/",
          { refresh: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.status === 200) {
          const newAccess = response.data.access;
          const newRefresh = response.data.refresh; // present when ROTATE_REFRESH_TOKENS=True
          localStorage.setItem("access_token", newAccess);
          if (newRefresh) {
            localStorage.setItem("refresh_token", newRefresh);
          }
          axios.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

          onRefreshed(newAccess);

          return axios.request(originalRequest);
        }
      } catch (err) {
        localStorage.clear();
        window.location.href = "/Auth";
        return Promise.reject(err);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
