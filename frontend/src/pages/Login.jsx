import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function Login() {
  const [username, setUsername] = useState("");  // Change back to username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
        // First, authenticate and get tokens
        const res = await api.post("/api/token/", { username, password });

        // Store tokens in local storage
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        // Use the access token to fetch user information
        const userInfoResponse = await api.get("/api/user/me/", {
            headers: {
                Authorization: `Bearer ${res.data.access}`,
            },
        });

        // Store user info in local storage
        localStorage.setItem('user', JSON.stringify(userInfoResponse.data));

        // Redirect after successful login
        navigate("/analytics");
    } catch (error) {
        alert("Login failed. Please try again.");
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-cream-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=brown&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-brown-800">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-brown-800">Username</label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-brown-800 shadow-sm ring-1 ring-inset ring-brown-600 placeholder:text-brown-600 focus:ring-2 focus:ring-inset focus:ring-brown-800 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-brown-800">Password</label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-brown-800 shadow-sm ring-1 ring-inset ring-brown-600 placeholder:text-brown-600 focus:ring-2 focus:ring-inset focus:ring-brown-800 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-brown-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brown-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-800"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-brown-600">
          Don't have an account?{" "}
          <a href="/register" className="font-semibold leading-6 text-brown-800 hover:text-brown-600">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}