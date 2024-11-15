import { useState } from "react";
import api from "../api";

function UserFormModal({ isOpen, onClose, onSuccess, companyId }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password1 !== password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userResponse = await api.post("/api/user/register/", {
        username,
        email,
        password: password1,
        role: "FARMER",
        company: companyId,
        first_name: firstName,
        last_name: lastName
      });

      await api.post("/api/farmers/", {
        user: userResponse.data.id,
        company: companyId,
        first_name: firstName,
        last_name: lastName
      });

      onSuccess();
      onClose();
      setUsername("");
      setEmail("");
      setPassword1("");
      setPassword2("");
      setFirstName("");
      setLastName("");
    } catch (error) {
      setError(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] z-50">
        <h2 className="text-xl font-bold mb-4">Add New Farmer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brown-800 text-white rounded hover:bg-brown-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Farmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal; 