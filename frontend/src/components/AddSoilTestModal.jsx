import { useState, useEffect } from "react";
import api from "../api"; // Axios instance for making API requests

function AddSoilTestModal({ isOpen, onClose }) {
    const [farmers, setFarmers] = useState([]);
    const [fields, setFields] = useState([]);
    const [labs, setLabs] = useState([]);
    const [crops, setCrops] = useState([]);
    const [selectedFarmer, setSelectedFarmer] = useState("");
    const [step, setStep] = useState("choose"); // Step to track user choice (choose, manual, upload)
    const [soilTestData, setSoilTestData] = useState({
        test_date: "",
        lab: "",
        field: "",
        crop: "",
        ph: "",
        salts: "",
        chlorides: "",
        sodium: "",
        cec: "",
        excess_lime: "",
        organic_matter: "",
        organic_n: "",
        ammonium_n: "",
        nitrate_n: "",
        phosphorus: "",
        potassium_ppm: "",
        potassium_meq_per_100g: "",
        calcium_ppm: "",
        calcium_meq_per_100g: "",
        magnesium_ppm: "",
        magnesium_meq_per_100g: "",
        sulfate: "",
        zinc: "",
        iron: "",
        manganese: "",
        copper: "",
        boron: "",
        recom_nitrogen: "",
        recom_phos: "",
        recom_potash: "",
        recom_calcium: "",
        recom_magnesium: "",
        recom_sulphur: "",
        recom_zinc: "",
        recom_iron: "",
        recom_manganese: "",
        recom_copper: "",
        recom_boron: "",
        recom_gypsum: "",
        recom_lime: "",
    });

    // Fetch the user's farmers on component mount
    useEffect(() => {
        if (isOpen) {
            setStep("choose"); // Reset step to "choose" when modal opens
            api.get("/api/farmers/")
                .then((res) => setFarmers(res.data))
                .catch((error) => console.error("Failed to fetch farmers:", error));
        }
    }, [isOpen]);

    // Fetch fields, labs, and crops when a farmer is selected
    useEffect(() => {
        if (selectedFarmer) {
            api.get(`/api/fields/?farmer=${selectedFarmer}`)
                .then((res) => setFields(res.data))
                .catch((error) => console.error("Failed to fetch fields:", error));

            api.get(`/api/labs/?farmer=${selectedFarmer}`)
                .then((res) => setLabs(res.data))
                .catch((error) => console.error("Failed to fetch labs:", error));

            api.get(`/api/crops/?farmer=${selectedFarmer}`)
                .then((res) => setCrops(res.data))
                .catch((error) => console.error("Failed to fetch crops:", error));

            setSoilTestData((prevData) => ({
                ...prevData,
                lab: "",
                field: "",
                crop: "",
            }));
        }
    }, [selectedFarmer]);
    // Reset form fields when the modal is closed
    const handleClose = () => {
        setSelectedFarmer("");
        setSoilTestData({
            test_date: "",
            lab: "",
            field: "",
            crop: "",
            ph: "",
            salts: "",
            chlorides: "",
            sodium: "",
            cec: "",
            excess_lime: "",
            organic_matter: "",
            organic_n: "",
            ammonium_n: "",
            nitrate_n: "",
            phosphorus: "",
            potassium_ppm: "",
            potassium_meq_per_100g: "",
            calcium_ppm: "",
            calcium_meq_per_100g: "",
            magnesium_ppm: "",
            magnesium_meq_per_100g: "",
            sulfate: "",
            zinc: "",
            iron: "",
            manganese: "",
            copper: "",
            boron: "",
            recom_nitrogen: "",
            recom_phos: "",
            recom_potash: "",
            recom_calcium: "",
            recom_magnesium: "",
            recom_sulphur: "",
            recom_zinc: "",
            recom_iron: "",
            recom_manganese: "",
            recom_copper: "",
            recom_boron: "",
            recom_gypsum: "",
            recom_lime: "",
        });
        setStep("choose"); // Reset step to "choose" when closing the modal
        onClose();  // Close the modal
    };
    const handleSubmit = async () => {
        try {
            await api.post("/api/soiltests/", soilTestData);
            onClose(); // Close the modal after successful submission
        } catch (error) {
            console.error("Failed to submit soil test:", error);
        }
    };

    return (
        isOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-cream-500 p-6 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
                    {step === "choose" && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-brown-800">Add Soil Test</h2>
                            <div className="flex justify-between space-x-2">
                                <button
                                    onClick={() => setStep("manual")}
                                    className="w-full bg-brown-800 text-white py-2 px-4 rounded-lg hover:bg-brown-600"
                                >
                                    Enter Manually
                                </button>
                                <button
                                    onClick={() => setStep("upload")}
                                    className="w-full bg-brown-800 text-white py-2 px-4 rounded-lg hover:bg-brown-600"
                                >
                                    Upload File
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "manual" && (
                        <div>
                            {/* Your existing form code goes here */}
                            {/* The content you already have */}
                            <h2 className="text-xl font-bold mb-4 text-brown-800">Add Soil Test Manually</h2>
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

                            <label className="block text-brown-800">Select Lab</label>
                            <select
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.lab}
                                onChange={(e) => setSoilTestData({ ...soilTestData, lab: e.target.value })}
                            >
                                <option value="">Select a lab</option>
                                {labs.map((lab) => (
                                    <option key={lab.lab_id} value={lab.lab_id}>
                                        {lab.lab_name}
                                    </option>
                                ))}
                            </select>

                            <label className="block text-brown-800">Select Field</label>
                            <select
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.field}
                                onChange={(e) => setSoilTestData({ ...soilTestData, field: e.target.value })}
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
                                value={soilTestData.crop}
                                onChange={(e) => setSoilTestData({ ...soilTestData, crop: e.target.value })}
                            >
                                <option value="">Select a crop</option>
                                {crops.map((crop) => (
                                    <option key={crop.crop_id} value={crop.crop_id}>
                                        {crop.crop_name}
                                    </option>
                                ))}
                            </select>

                            <label className="block text-brown-800">Test Date</label>
                            <input
                                type="date"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.test_date}
                                onChange={(e) => setSoilTestData({ ...soilTestData, test_date: e.target.value })}
                            />

                            <label className="block text-brown-800">pH</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.ph}
                                onChange={(e) => setSoilTestData({ ...soilTestData, ph: e.target.value })}
                            />

                            {/* Continue adding inputs for the remaining fields in a similar pattern */}
                            <label className="block text-brown-800">Salts</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.salts}
                                onChange={(e) => setSoilTestData({ ...soilTestData, salts: e.target.value })}
                            />

                            <label className="block text-brown-800">Chlorides</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.chlorides}
                                onChange={(e) => setSoilTestData({ ...soilTestData, chlorides: e.target.value })}
                            />

                            <label className="block text-brown-800">Sodium</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.sodium}
                                onChange={(e) => setSoilTestData({ ...soilTestData, sodium: e.target.value })}
                            />

                            <label className="block text-brown-800">CEC</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.cec}
                                onChange={(e) => setSoilTestData({ ...soilTestData, cec: e.target.value })}
                            />

                            <label className="block text-brown-800">Excess Lime</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.excess_lime}
                                onChange={(e) => setSoilTestData({ ...soilTestData, excess_lime: e.target.value })}
                            />

                            <label className="block text-brown-800">Organic Matter</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.organic_matter}
                                onChange={(e) => setSoilTestData({ ...soilTestData, organic_matter: e.target.value })}
                            />

                            <label className="block text-brown-800">Organic Nitrogen</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.organic_n}
                                onChange={(e) => setSoilTestData({ ...soilTestData, organic_n: e.target.value })}
                            />

                            <label className="block text-brown-800">Ammonium Nitrogen</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.ammonium_n}
                                onChange={(e) => setSoilTestData({ ...soilTestData, ammonium_n: e.target.value })}
                            />

                            <label className="block text-brown-800">Nitrate Nitrogen</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.nitrate_n}
                                onChange={(e) => setSoilTestData({ ...soilTestData, nitrate_n: e.target.value })}
                            />

                            <label className="block text-brown-800">Phosphorus</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.phosphorus}
                                onChange={(e) => setSoilTestData({ ...soilTestData, phosphorus: e.target.value })}
                            />

                            <label className="block text-brown-800">Potassium (ppm)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.potassium_ppm}
                                onChange={(e) => setSoilTestData({ ...soilTestData, potassium_ppm: e.target.value })}
                            />

                            <label className="block text-brown-800">Potassium (meq/100g)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.potassium_meq_per_100g}
                                onChange={(e) => setSoilTestData({ ...soilTestData, potassium_meq_per_100g: e.target.value })}
                            />

                            <label className="block text-brown-800">Calcium (ppm)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.calcium_ppm}
                                onChange={(e) => setSoilTestData({ ...soilTestData, calcium_ppm: e.target.value })}
                            />

                            <label className="block text-brown-800">Calcium (meq/100g)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.calcium_meq_per_100g}
                                onChange={(e) => setSoilTestData({ ...soilTestData, calcium_meq_per_100g: e.target.value })}
                            />

                            <label className="block text-brown-800">Magnesium (ppm)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.magnesium_ppm}
                                onChange={(e) => setSoilTestData({ ...soilTestData, magnesium_ppm: e.target.value })}
                            />

                            <label className="block text-brown-800">Magnesium (meq/100g)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.magnesium_meq_per_100g}
                                onChange={(e) => setSoilTestData({ ...soilTestData, magnesium_meq_per_100g: e.target.value })}
                            />

                            <label className="block text-brown-800">Sulfate</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.sulfate}
                                onChange={(e) => setSoilTestData({ ...soilTestData, sulfate: e.target.value })}
                            />

                            <label className="block text-brown-800">Zinc</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.zinc}
                                onChange={(e) => setSoilTestData({ ...soilTestData, zinc: e.target.value })}
                            />

                            <label className="block text-brown-800">Iron</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.iron}
                                onChange={(e) => setSoilTestData({ ...soilTestData, iron: e.target.value })}
                            />

                            <label className="block text-brown-800">Manganese</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.manganese}
                                onChange={(e) => setSoilTestData({ ...soilTestData, manganese: e.target.value })}
                            />

                            <label className="block text-brown-800">Copper</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.copper}
                                onChange={(e) => setSoilTestData({ ...soilTestData, copper: e.target.value })}
                            />

                            <label className="block text-brown-800">Boron</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.boron}
                                onChange={(e) => setSoilTestData({ ...soilTestData, boron: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Nitrogen</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_nitrogen}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_nitrogen: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Phosphorus</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_phos}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_phos: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Potash</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_potash}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_potash: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Calcium</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_calcium}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_calcium: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Magnesium</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_magnesium}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_magnesium: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Sulphur</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_sulphur}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_sulphur: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Zinc</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_zinc}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_zinc: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Iron</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_iron}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_iron: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Manganese</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_manganese}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_manganese: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Copper</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_copper}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_copper: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Boron</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_boron}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_boron: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Gypsum</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_gypsum}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_gypsum: e.target.value })}
                            />

                            <label className="block text-brown-800">Recommended Lime</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                                value={soilTestData.recom_lime}
                                onChange={(e) => setSoilTestData({ ...soilTestData, recom_lime: e.target.value })}
                            />
                            <div className="flex justify-between space-x-2 mt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-brown-800 text-white py-2 px-4 rounded-lg hover:bg-brown-600"
                                >
                                    Submit Soil Test
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "upload" && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-brown-800">Upload Soil Test File</h2>
                            <input
                                type="file"
                                className="w-full mb-4 p-2 border-2 border-brown-600 rounded-lg"
                                onChange={(e) => console.log(e.target.files[0])} // Placeholder for file handling
                            />
                            <div className="flex justify-between space-x-2">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    );
}

export default AddSoilTestModal;
