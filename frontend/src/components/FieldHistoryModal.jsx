import { useState, useEffect } from "react";
import api from "../api"; // Axios instance for making API requests

function FieldHistoryModal({ isOpen, onClose }) {
    const [farmers, setFarmers] = useState([]);
    const [fields, setFields] = useState([]);
    const [crops, setCrops] = useState([]);
    const [selectedFarmer, setSelectedFarmer] = useState("");
    const [fieldHistoryData, setFieldHistoryData] = useState({
        field: "",
        crop: "",
        plant_date: "",
        harvest_date: "",
        yield_amount: ""
    });

    // Fetch the user's farmers on component mount
    useEffect(() => {
        if (isOpen) {
            api.get("/api/farmers/") // Fetch the user's farmers
                .then((res) => setFarmers(res.data))
                .catch((error) => console.error("Failed to fetch farmers:", error));
        }
    }, [isOpen]);

    // Fetch fields and crops when a farmer is selected
    useEffect(() => {
        if (selectedFarmer) {
            // Fetch the fields for the selected farmer
            api.get(`/api/fields/?farmer=${selectedFarmer}`)
                .then((res) => setFields(res.data))
                .catch((error) => console.error("Failed to fetch fields:", error));

            api.get(`/api/crops/?farmer=${selectedFarmer}`)
                .then((res) => setCrops(res.data))
                .catch((error) => console.error("Failed to fetch crops:", error));
            // Reset field and crop when a new farmer is selected
            setFieldHistoryData((prevData) => ({
                ...prevData,
                field: "",
                crop: ""
            }));
        }
    }, [selectedFarmer]);

    const handleSubmit = async () => {
        try {
            const payload = { ...fieldHistoryData };
            await api.post("/api/fieldhistory/", payload); // Submit field history
            onClose(); // Close modal after successful submission
        } catch (error) {
            console.error("Failed to add field history:", error);
        }
    };

    return (
        isOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-cream-500 p-6 rounded-lg shadow-lg w-[400px]">
                    <h2 className="text-xl font-bold mb-4 text-brown-800">Add Field History</h2>

                    <label className="block text-brown-800">Select Farmer</label>
                    <select
                        className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
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

                    <label className="block text-brown-800">Select Field</label>
                    <select
                        className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                        value={fieldHistoryData.field}
                        onChange={(e) => setFieldHistoryData({ ...fieldHistoryData, field: e.target.value })}
                    >
                        <option value="">Select a field</option>
                        {fields.map((field) => (
                            <option key={field.field_id} value={field.field_id}>
                                {field.field_name}
                            </option>
                        ))}
                    </select>

                    <label className="block text-brown-800">Select Crop</label>
                    <select
                        className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                        value={fieldHistoryData.crop}
                        onChange={(e) => setFieldHistoryData({ ...fieldHistoryData, crop: e.target.value })}
                    >
                        <option value="">Select a crop</option>
                        {crops.map((crop) => (
                            <option key={crop.crop_id} value={crop.crop_id}>
                                {crop.crop_name}
                            </option>
                        ))}
                    </select>

                    <label className="block text-brown-800">Plant Date</label>
                    <input
                        type="date"
                        className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                        value={fieldHistoryData.plant_date}
                        onChange={(e) => setFieldHistoryData({ ...fieldHistoryData, plant_date: e.target.value })}
                    />

                    <label className="block text-brown-800">Harvest Date</label>
                    <input
                        type="date"
                        className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                        value={fieldHistoryData.harvest_date}
                        onChange={(e) => setFieldHistoryData({ ...fieldHistoryData, harvest_date: e.target.value })}
                    />

                    <label className="block text-brown-800">Yield Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                        value={fieldHistoryData.yield_amount}
                        onChange={(e) => setFieldHistoryData({ ...fieldHistoryData, yield_amount: e.target.value })}
                    />

                    <div className="flex justify-between space-x-2 mt-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-brown-800 text-white py-2 px-4 rounded-lg hover:bg-brown-600 transition"
                        >
                            Add Field History
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}

export default FieldHistoryModal;