import { useState, useEffect } from "react";
import api from "../api"; // Import the existing Axios instance

function AddCropModal({ isOpen, onClose }) {
  const [farmers, setFarmers] = useState([]); // Store farmers list
  const [cropName, setCropName] = useState(""); // Track crop name
  const [selectedFarmer, setSelectedFarmer] = useState(""); // Track selected farmer
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFarmers();
    }
  }, [isOpen]);

  const fetchFarmers = async () => {
    try {
      const response = await api.get("/api/farmers/"); // Fetch farmers
      setFarmers(response.data);
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
    }
  };

  const handleAddCrop = async () => {
    setLoading(true);
    try {
      const payload = {
        crop_name: cropName,
        farmer: selectedFarmer,
      };
      await api.post("/api/crops/", payload); // Submit to the Crop endpoint
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to add crop:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-cream-500 p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-brown-800">Add Crop</h2>
        <input
          type="text"
          placeholder="Enter crop name"
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
        />
        <select
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
          value={selectedFarmer}
          onChange={(e) => setSelectedFarmer(e.target.value)}
        >
          <option value="">Select Farmer</option>
          {farmers.map((farmer) => (
            <option key={farmer.id} value={farmer.id}>
              {farmer.farmer_fname} {farmer.farmer_lname}
            </option>
          ))}
        </select>
        <div className="flex justify-between space-x-2">
          <button
            onClick={handleAddCrop}
            className="w-full bg-brown-800 text-white py-2 px-4 rounded hover:bg-brown-600 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Crop"}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-brown-600 text-white py-2 px-4 rounded hover:bg-brown-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCropModal;