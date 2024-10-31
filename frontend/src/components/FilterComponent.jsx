import { useState, useEffect } from "react";
import api from "../api"; // Axios instance for making API requests
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FilterComponent({ onGenerateGraph }) {
    const [farmers, setFarmers] = useState([]);
    const [fields, setFields] = useState([]);
    const [crops, setCrops] = useState([]);
    const [selectedFarmer, setSelectedFarmer] = useState("");
    const [filterType, setFilterType] = useState("field"); // 'field' or 'crop'
    const [selectedFilters, setSelectedFilters] = useState([]); // Multiple selections
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [graphType, setGraphType] = useState("bar");
    const [selectedFields, setSelectedFields] = useState([]);
    const [viewType, setViewType] = useState("soil");

    const soilTestFields = [
        "ph", "salts", "chlorides", "sodium", "cec", "excess_lime", "organic_matter",
        "organic_n", "ammonium_n", "nitrate_n", "phosphorus", "potassium_ppm",
        "potassium_meq_per_100g", "calcium_ppm", "calcium_meq_per_100g",
        "magnesium_ppm", "magnesium_meq_per_100g", "sulfate", "zinc", "iron",
        "manganese", "copper", "boron", "recom_nitrogen", "recom_phos",
        "recom_potash", "recom_calcium", "recom_magnesium", "recom_sulphur",
        "recom_zinc", "recom_iron", "recom_manganese", "recom_copper", "recom_boron",
        "recom_gypsum", "recom_lime"
    ];

    useEffect(() => {
        // Fetch the user's farmers
        api.get("/api/farmers/")
            .then((res) => setFarmers(res.data))
            .catch((error) => console.error("Failed to fetch farmers:", error));
    }, []);

    // Fetch fields/crops when a farmer is selected
    useEffect(() => {
        if (selectedFarmer) {
            if (filterType === "field") {
                api.get(`/api/fields/?farmer=${selectedFarmer}`)
                    .then((res) => setFields(res.data))
                    .catch((error) => console.error("Failed to fetch fields:", error));
            } else {
                api.get(`/api/crops/?farmer=${selectedFarmer}`)
                    .then((res) => setCrops(res.data))
                    .catch((error) => console.error("Failed to fetch crops:", error));
            }
        }
    }, [selectedFarmer, filterType]);

    const handleGenerateGraph = () => {
        onGenerateGraph({
            farmer: selectedFarmer,
            filterType: viewType === "yields" ? "field" : filterType,
            filterValues: selectedFilters,
            startDate,
            endDate,
            graphType,
            viewType,
            selectedFields: viewType === "yields" ? ["yield_number"] : selectedFields
        });
    };

    return (
        <div className="p-4 bg-cream-400 rounded-lg">
            <h2 className="text-lg font-bold text-brown-800 mb-4">Pick to Graph</h2>
            <div className="flex mb-4">
                <button
                    className={`w-1/2 p-2 rounded-l-lg ${viewType === "soil" ? "bg-brown-800 text-white" : "bg-gray-300"}`}
                    onClick={() => {
                        setViewType("soil");
                        setFilterType("field");
                    }}
                >
                    Soil
                </button>
                <button
                    className={`w-1/2 p-2 rounded-r-lg ${viewType === "yields" ? "bg-brown-800 text-white" : "bg-gray-300"}`}
                    onClick={() => {
                        setViewType("yields");
                        setFilterType("field");
                    }}
                >
                    Yields
                </button>
            </div>

            <h2 className="text-lg font-bold text-brown-800 mb-4">Filter Options</h2>

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

            <label className="block text-brown-800">Filter By</label>
            <div className="flex mb-2">
                <button
                    className={`w-1/2 p-2 rounded-l-lg ${filterType === "field" ? "bg-brown-800 text-white" : "bg-gray-300"}`}
                    onClick={() => setFilterType("field")}
                >
                    Field
                </button>
                {viewType === "soil" && (
                    <button
                        className={`w-1/2 p-2 rounded-r-lg ${filterType === "crop" ? "bg-brown-800 text-white" : "bg-gray-300"}`}
                        onClick={() => setFilterType("crop")}
                    >
                        Crop
                    </button>
                )}
            </div>

            <label className="block text-brown-800">Select {filterType === "field" ? "Fields" : "Crops"}</label>

            <div className="w-full mb-4 p-2 border-2 border-brown-600 rounded-lg max-h-[150px] overflow-y-auto">
                {(filterType === "field" ? fields : crops).map((item) => (
                    <div key={item[filterType === "field" ? "field_id" : "crop_id"]} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            value={item[filterType === "field" ? "field_id" : "crop_id"].toString()} // Ensure it's a string
                            checked={selectedFilters.includes(item[filterType === "field" ? "field_id" : "crop_id"].toString())} // Compare as string
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                const value = e.target.value; // This will be a string

                                setSelectedFilters((prevSelected) =>
                                    isChecked
                                        ? [...prevSelected, value] // Add as a string
                                        : prevSelected.filter((f) => f !== value) // Remove by string comparison
                                );
                            }}
                            className="mr-2"
                        />
                        <label className="text-brown-800">{item[filterType === "field" ? "field_name" : "crop_name"]}</label>
                    </div>
                ))}
            </div>

            <div className="flex space-x-4 mb-2">
                <div className="w-1/2">
                    <label className="block text-brown-800">Start Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border-2 border-brown-600 rounded-lg"
                        value={startDate || ""}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="w-1/2">
                    <label className="block text-brown-800">End Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border-2 border-brown-600 rounded-lg"
                        value={endDate || ""}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <label className="block text-brown-800">Graph Type</label>
            <select
                className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg"
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
            >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
            </select>

            {viewType === "soil" && (
                <>
                    <label className="block text-brown-800">Select Values to Graph</label>
                    <div className="w-full mb-4 p-2 border-2 border-brown-600 rounded-lg max-h-[150px] overflow-y-auto">
                        {soilTestFields.map((field, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id={`field-${index}`}
                                    value={field}
                                    checked={selectedFields.includes(field)}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSelectedFields((prevSelected) =>
                                            isChecked
                                                ? [...prevSelected, field]
                                                : prevSelected.filter((f) => f !== field)
                                        );
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor={`field-${index}`} className="text-brown-800">{field}</label>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button
                onClick={handleGenerateGraph}
                className="w-full bg-brown-800 text-white py-2 px-4 rounded-lg hover:bg-brown-600"
            >
                Generate Graph
            </button>
        </div>
    );
}

export default FilterComponent;