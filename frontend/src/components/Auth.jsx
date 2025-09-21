import axios from "axios";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // toggle login/signup
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // 🔹 LOGIN
        const { data } = await axios.post("http://127.0.0.1:8000/auth/login/", {
          email,
          password,
        });

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

        alert("Login successful!");
        window.location.href = "/Dashboard";
      } else {
        // 🔹 SIGNUP
        await axios.post("http://127.0.0.1:8000/auth/signup/", {
          username,
          email,
          password,
        });

        alert("Signup successful! Please login.");
        setIsLogin(true);
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h3>

        <form onSubmit={submit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const id_token = credentialResponse.credential;
                if (!id_token) throw new Error("No credential returned by Google");

                const { data } = await axios.post(
                  "http://127.0.0.1:8000/auth/google/",
                  { id_token },
                  { headers: { "Content-Type": "application/json" } }
                );

                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
                window.location.href = "/Dashboard";
              } catch (err) {
                console.error(err);
                alert(
                  err.response?.data?.error ||
                    "Google sign-in failed. Please try again."
                );
              }
            }}
            onError={() => {
              alert("Google sign-in failed. Please try again.");
            }}
          />
        </div>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
