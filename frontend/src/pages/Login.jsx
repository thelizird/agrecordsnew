import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const response = await api.post("/api/token/", {
        identifier: identifier,
        password: password,
      });

      if (response.data.access) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        localStorage.setItem('userRole', response.data.role);

        const userInfoResponse = await api.get("/api/user/me/", {
          headers: {
            Authorization: `Bearer ${response.data.access}`,
          },
        });

        localStorage.setItem('user', JSON.stringify(userInfoResponse.data));
        navigate("/analytics");
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      const errorMessage = error.response?.data?.detail || 
                        "Login failed. Please check your credentials.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-cream-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=brown&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-brown-800">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium leading-6 text-brown-800">
              Email or Username
            </label>
            <div className="mt-2">
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-brown-800 shadow-sm ring-1 ring-inset ring-brown-600 placeholder:text-brown-600 focus:ring-2 focus:ring-inset focus:ring-brown-800 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-brown-800">
              Password
            </label>
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
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-brown-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brown-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-800"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}