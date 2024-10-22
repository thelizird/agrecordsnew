import { useState, useEffect } from 'react';
import api from '../api'; // Axios instance for making API requests
import Header from "../components/Header";

function Reports() {
    const [categories] = useState([
        "fertilizer_application",
        "seeding_new_crop",
        "irrigation",
        "herbicide_application",
        "pesticide_application",
        "harvest",
        "mechanical_disturbance",
        "weather",
        "livestock",
        "management",
        "other"
    ]);
    const [currentPage, setCurrentPage] = useState("reports");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [textEntry, setTextEntry] = useState("");
    const [entries, setEntries] = useState({});

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const fetchedEntries = {};
                for (const category of categories) {
                    const res = await api.get(`/api/reports/${category}/`);
                    fetchedEntries[category] = res.data.text;  // Keep the full text as a single entry
                }
                setEntries(fetchedEntries);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
        };
        fetchEntries();
    }, [categories]);

    const handleSubmit = async () => {
        if (selectedCategory && textEntry) {
            const newEntry = { new_entry: textEntry };

            try {
                await api.post(`/api/reports/${selectedCategory}/`, newEntry);
                setEntries((prevEntries) => ({
                    ...prevEntries,
                    [selectedCategory]: prevEntries[selectedCategory] + '\n' + textEntry  // Append new entry
                }));
                setTextEntry(""); // Clear input after submission
            } catch (error) {
                console.error("Error saving report entry:", error);
            }
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header at the top */}
            <Header currentPage={currentPage} />

            {/* Main content area below the header */}
            <div className="flex flex-grow">
                {/* Left side: Categories list */}
                <div className="w-1/4 bg-cream-500 rounded-lg my-5 mx-5 p-6"> {/* Added padding (p-6) */}
                    <h2 className="text-brown-800 text-xl mb-4">Categories</h2>
                    <ul className="space-y-2">
                        {categories.map((category, index) => (
                            <li
                                key={index}
                                onClick={() => setSelectedCategory(category)}
                                className={`cursor-pointer p-2 rounded-lg flex items-center text-lg font-bold text-brown-800 mb-4 ${selectedCategory === category ? "border-l-4 border-green-500 " : ""
                                    }`}
                            >
                                {category.replace("_", " ").charAt(0).toUpperCase() + category.replace("_", " ").slice(1)}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right side: Report details and entry section */}
                <div className="w-3/4 p-6 bg-white flex flex-col justify-between">
                    {selectedCategory ? (
                        <>
                            {/* Report Entries Section */}
                            <div>
                                <h2 className="text-brown-800 text-2xl mb-4">
                                    {selectedCategory.replace("_", " ").charAt(0).toUpperCase() + selectedCategory.replace("_", " ").slice(1)} 2024 Report
                                </h2>
                                <div className="p-2 bg-white rounded-lg shadow mb-4">
                                    {/* Display the full text in one block */}
                                    <p className="whitespace-pre-line">
                                        {entries[selectedCategory] || "No entries yet for this report."}
                                    </p>
                                </div>
                            </div>

                            {/* Enter Update Section */}
                            <div>
                                <textarea
                                    value={textEntry}
                                    onChange={(e) => setTextEntry(e.target.value)}
                                    rows="4"
                                    className="w-full p-2 border-2 border-brown-600 rounded-lg mb-4"
                                    placeholder="Enter your update"
                                />
                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-brown-800 text-xl">Please select a category from the left to begin.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reports;