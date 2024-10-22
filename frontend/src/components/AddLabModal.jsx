import { useState, useEffect } from "react";
import api from "../api"; // Import your axios instance

function AddLabModal({ isOpen, onClose }) {
  const [labName, setLabName] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch farmers when the modal is opened
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await api.get("/api/farmers/");
        setFarmers(response.data);
      } catch (error) {
        console.error("Error fetching farmers:", error);
      }
    };

    if (isOpen) {
      fetchFarmers();
    }
  }, [isOpen]);

  // Handle form submission to add a lab
  const handleAddLab = async () => {
    setLoading(true);
    try {
      const payload = { lab_name: labName, farmer: selectedFarmer };
      await api.post("/api/labs/", payload); // Send POST request
      setLabName(''); // Reset form fields
      setSelectedFarmer('');
      onClose(); // Close modal after submission
    } catch (error) {
      console.error("Error adding lab:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-cream-500 p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-brown-800">Add Lab</h2>
        <input
          type="text"
          placeholder="Enter lab name"
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
        />
        <label className="block mb-2 text-brown-800 font-bold">Select Farmer</label>
        <select
          className="w-full mb-4 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
          value={selectedFarmer}
          onChange={(e) => setSelectedFarmer(e.target.value)}
        >
          <option value="">Select a farmer</option>
          {farmers.map((farmer) => (
            <option key={farmer.id} value={farmer.id}>
              {farmer.farmer_fname} {farmer.farmer_lname}
            </option>
          ))}
        </select>
        <div className="flex justify-between space-x-2">
          <button
            onClick={handleAddLab}
            className="w-full bg-brown-800 text-white py-2 px-4 rounded hover:bg-brown-600 transition"
            disabled={loading || !labName || !selectedFarmer}
          >
            {loading ? 'Saving...' : 'Save Lab'}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 py-2 px-4 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddLabModal;