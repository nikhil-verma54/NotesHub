import { useEffect } from "react";
import axios from "axios";

export default function Logout() {
  useEffect(() => {
    (async () => {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const accessToken = localStorage.getItem("access_token");

        await axios.post(
          "http://127.0.0.1:8000/auth/logout/",
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,  // 👈 important
            },
          }
        );

        // Clear tokens after successful logout
        localStorage.clear();
        delete axios.defaults.headers.common["Authorization"];

        // Redirect to login
        window.location.href = "/Auth";
      } catch (e) {
        console.error("Logout not working", e.response?.data || e.message);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Logging you out...
        </h2>
        <p className="text-gray-500 mt-2">Please wait a moment</p>
      </div>
    </div>
  );
}
