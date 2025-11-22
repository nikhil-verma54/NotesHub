import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css'
import './interceptors/axios';
import { GoogleOAuthProvider } from "@react-oauth/google";

// Get Google OAuth client ID from environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

if (!googleClientId) {
  console.error('VITE_GOOGLE_OAUTH_CLIENT_ID is not set in environment variables');
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {googleClientId && (
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    )}
    {!googleClientId && (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Google OAuth Client ID is not configured. Please check your .env file.
      </div>
    )}
  </React.StrictMode>
)
