import { useState, useEffect } from "react";
import api from "../api";

function AddYieldModal({ isOpen, onClose }) {
  const [farmers, setFarmers] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [date, setDate] = useState("");
  const [yieldNumber, setYieldNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchFarmers();
  }, [isOpen]);

  const fetchFarmers = async () => {
    try {
      const response = await api.get("/api/farmers/");
      setFarmers(response.data);
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
    }
  };

  useEffect(() => {
    if (selectedFarmer) fetchFields(selectedFarmer);
  }, [selectedFarmer]);

  const fetchFields = async (farmerId) => {
    try {
      const response = await api.get(`/api/fields/?farmer=${farmerId}`);
      setFields(response.data);
    } catch (error) {
      console.error("Failed to fetch fields:", error);
    }
  };

  const resetForm = () => {
    setSelectedFarmer("");
    setSelectedField("");
    setDate("");
    setYieldNumber("");
  };

  const handleAddYield = async () => {
    setLoading(true);
    try {
      const payload = {
        farmer: selectedFarmer,
        field: selectedField,
        date,
        yield_number: yieldNumber,
      };
      await api.post("/api/yields/", payload);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to add yield:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-cream-500 p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-brown-800">Add Yield</h2>
        <select
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-white text-brown-800"
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
        <select
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-white text-brown-800"
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          disabled={!selectedFarmer}
        >
          <option value="">Select Field</option>
          {fields.map((field) => (
            <option key={field.field_id} value={field.field_id}>
              {field.field_name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-white text-brown-800"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter yield number"
          className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-white text-brown-800"
          value={yieldNumber}
          onChange={(e) => setYieldNumber(e.target.value)}
        />
        <div className="flex justify-between space-x-2">
          <button
            onClick={handleAddYield}
            className="w-full bg-brown-800 text-white py-2 px-4 rounded hover:bg-brown-600 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Yield"}
          </button>
          <button
            onClick={() => { resetForm(); onClose(); }} // Call resetForm when closing the modal
            className="w-full bg-brown-600 text-white py-2 px-4 rounded hover:bg-brown-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddYieldModal;