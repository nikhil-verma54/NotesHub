// Import the react JS packages
import { useEffect, useState } from "react";
import axios from "../components/AxiosInstance";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DEBUG: Log environment info
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Environment Mode:', import.meta.env.MODE);
    console.log('API Deploy URL:', import.meta.env.VITE_API_BASE_URL_DEPLOY);
    console.log('API Local URL:', import.meta.env.VITE_API_BASE_URL_LOCAL);
    console.log('Axios Base URL:', axios.defaults.baseURL);
    console.log('Has Access Token:', !!localStorage.getItem("access_token"));
    console.log('Access Token:', localStorage.getItem("access_token")?.substring(0, 20) + '...');
  }, []);

  // Fetch user details on mount
  useEffect(() => {
    if (localStorage.getItem("access_token") === null) {
      console.log('No access token found, redirecting to Auth');
      window.location.href = "/Auth";
    } else {
      (async () => {
        try {
          console.log('Attempting to fetch user data from:', axios.defaults.baseURL + '/auth/home/');
          
          const { data } = await axios.get("/auth/home/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          
          console.log('✅ User data received:', data);
          
          setUser({
            username: data.username,
            email: data.email,
            isSuperUser: data.is_superuser,
          });
          setLoading(false);
        } catch (e) {
          console.error('❌ Dashboard Error:', e);
          console.error('Error Response:', e.response);
          console.error('Error Status:', e.response?.status);
          console.error('Error Data:', e.response?.data);
          console.error('Request URL:', e.config?.url);
          console.error('Base URL:', e.config?.baseURL);
          
          setError(e.response?.data?.detail || e.message || 'Failed to load dashboard');
          setLoading(false);
          
          // Only redirect after 3 seconds so user can see error
          setTimeout(() => {
            window.location.href = "/Auth";
          }, 3000);
        }
      })();
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await axios.post("/auth/logout/", { refresh_token: refreshToken }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/Auth";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Loading dashboard...</p>
          <p className="text-sm text-gray-500">Check console (F12) for debug info</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Dashboard Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2 text-left bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-xs text-gray-600">
              <strong>API URL:</strong> {axios.defaults.baseURL}
            </p>
            <p className="text-xs text-gray-600">
              <strong>Mode:</strong> {import.meta.env.MODE}
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/Auth"}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-25 ">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.username} 👋
          </h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
          >
            Logout
          </button>
        </div>

        {/* User info */}
        <div className="space-y-3">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
        </div>

        {/* NotesHub extras */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/UploadNotes"
              className="p-4 text-center bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition"
            >
              ➕ Create Note
            </Link>
            <Link
              to="/MyNotes"
              className="p-4 text-center bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
            >
              📑 My Notes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}