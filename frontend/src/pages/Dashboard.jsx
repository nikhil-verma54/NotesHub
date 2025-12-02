// Import the react JS packages
import { useEffect, useState } from "react";
import axios from "../components/AxiosInstance";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  console.log('=== ENV CHECK ===');
  console.log('All env vars:', import.meta.env);
  console.log('Mode:', import.meta.env.MODE);
  console.log('Deploy URL:', import.meta.env.VITE_API_BASE_URL_DEPLOY);
  console.log('Local URL:', import.meta.env.VITE_API_BASE_URL_LOCAL);
  console.log('Google Client:', import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);
}, []);

  // Fetch user details on mount
  useEffect(() => {
    if (localStorage.getItem("access_token") === null) {
      window.location.href = "/Auth";
    } else {
      (async () => {
        try {
          const { data } = await axios.get("/auth/home/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          setUser({
            username: data.username, // backend sends "username" as "message"
            email: data.email,
            isSuperUser: data.is_superuser,
          });
          setLoading(false);
        } catch (e) {
          console.log("Not authorized");
          window.location.href = "/Auth";
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
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
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
