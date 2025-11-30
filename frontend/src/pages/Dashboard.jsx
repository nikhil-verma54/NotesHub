// Import the react JS packages
import { useEffect, useState } from "react";
import axios from "../components/AxiosInstance";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/Auth";
        return;
      }

      try {
        // First try to get user data from the backend
        try {
          const { data } = await axios.get("/auth/home/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          // The backend returns username directly in the response
          setUser({
            username: data.username || 'User',
            email: data.email || 'No email',
            isSuperUser: data.is_superuser || false,
          });
        } catch (error) {
          console.warn("Could not fetch user details:", error);
          // If we can't get user details, still render the dashboard with minimal data
          setUser({
            username: 'User',
            email: 'No email available',
            isSuperUser: false,
          });
        }
      } catch (e) {
        console.error("Authentication error:", e);
        // Only redirect to login if there's an actual auth error
        if (e.response?.status === 401) {
          window.location.href = "/Auth";
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If user data couldn't be loaded but we're not in a loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong</h2>
          <p className="mb-4">We couldn't load your dashboard data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Logout
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
          {/* <p className="text-lg text-gray-700">
            <span className="font-semibold">Role:</span>{" "}
            {user?.isSuperUser ? "Admin" : "User"}
          </p> */}
        </div>

        {/* NotesHub extras */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
            to = "/UploadNotes"
             className="p-4 text-center bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition">
              ➕ Create Note
            </Link>
            <Link
            to = "/MyNotes"
             className="p-4 text-center bg-blue-500 text-white rounded-xl shadow hover:bg-green-600 transition">
              📑 My Notes
            </Link>

            {/* <button className="p-4  bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600 transition">
              ⭐ Favorites
            </button>
            <button className="p-4 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transition">
              ⚙️ Settings
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
