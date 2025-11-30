import axios from 'axios'

// const myBaseUrl = 'http://127.0.0.1:8000/';

const isDevelopment = import.meta.env.MODE === 'development'
const myBaseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_DEPLOY

const AxiosInstance = axios.create({
    baseURL: myBaseUrl,
    timeout: 5000,
    headers: {
        "Content-Type":"application/json",
        accept: "application/json"
    }
});

export default AxiosInstance