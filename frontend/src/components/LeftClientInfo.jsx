import { useState, useEffect } from "react";
import api from "../api";

function LeftClientInfo({ selectedClient }) {
    const [fields, setFields] = useState([]);
    const [newFieldData, setNewFieldData] = useState({
        field_name: '',
        state: '',
        city: '',
        address: '',
        zip: '',
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);

    useEffect(() => {
        if (selectedClient) fetchClientFields(selectedClient.id);
    }, [selectedClient]);

    const fetchClientFields = async (farmerId) => {
        try {
            const response = await api.get(`/api/fields/?farmer=${farmerId}`);
            setFields(response.data);
        } catch (error) {
            console.error("Failed to fetch farmer fields:", error);
        }
    };

    const handleAddField = async () => {
        setLoading(true);
        try {
            const payload = { ...newFieldData, farmer: selectedClient.id };
            const response = await api.post("/api/fields/", payload);
            setFields([...fields, response.data]);
            setNewFieldData({
                field_name: '',
                state: '',
                city: '',
                address: '',
                zip: '',
                latitude: '',
                longitude: ''
            });
            setIsAddFieldModalOpen(false);
        } catch (error) {
            console.error("Failed to add new field:", error);
        } finally {
            setLoading(false);
        }
    };

    const openFieldModal = (field) => {
        setSelectedField(field);
        setIsFieldModalOpen(true);
    };

    const closeFieldModal = () => {
        setSelectedField(null);
        setIsFieldModalOpen(false);
    };

    const openDeleteConfirmation = () => {
        setIsDeleteConfirmationOpen(true);
    };

    const closeDeleteConfirmation = () => {
        setIsDeleteConfirmationOpen(false);
    };

    const handleDeleteField = async () => {
        if (!selectedField) return;
        try {
            await api.delete(`/api/fields/${selectedField.field_id}/`);
            setFields(fields.filter(field => field.field_id !== selectedField.field_id));
            closeDeleteConfirmation();
            closeFieldModal();
        } catch (error) {
            console.error("Failed to delete field:", error);
        }
    };

    const handleUpdateField = async () => {
        if (!selectedField) return;
        try {
            const payload = { ...selectedField, farmer: selectedClient.id };
            await api.put(`/api/fields/${selectedField.field_id}/`, payload);
            fetchClientFields(selectedClient.id);
            closeFieldModal();
        } catch (error) {
            console.error("Failed to update field:", error);
        }
    };

    const openAddFieldModal = () => setIsAddFieldModalOpen(true);
    const closeAddFieldModal = () => setIsAddFieldModalOpen(false);

    return (
        <div className="w-1/4 bg-cream-500 rounded-lg my-5 mx-5 min-h-[200px] max-h-[90vh] p-5 flex flex-col justify-between">
            {selectedClient ? (
                <>
                    <div>
                        <h2 className="text-xl font-semibold">Farmer Information</h2>
                        <p><strong>Name:</strong> {selectedClient.farmer_fname} {selectedClient.farmer_lname}</p>
                    </div>

                    <div className="mt-4 flex-1 overflow-y-auto">
                        <h3 className="text-lg font-semibold">Fields:</h3>
                        {fields.length === 0 ? (
                            <p>Farmer has no fields</p>
                        ) : (
                            <ul className="space-y-2">
                                {fields.map((field) => (
                                    <li
                                        key={field.field_id}
                                        className="bg-white p-2 rounded-lg border border-black hover:bg-gray-200 cursor-pointer"
                                        onClick={() => openFieldModal(field)}
                                    >
                                        <strong>Field:</strong> {field.field_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Add New Field Button */}
                    <div className="mt-6">
                        <button
                            onClick={openAddFieldModal}
                            className="w-full bg-brown-800 text-white py-2 px-4 rounded hover:bg-brown-600 transition"
                        >
                            Click to Add a New Field
                        </button>
                    </div>
                </>
            ) : (
                <p className="text-lg">Click on a Farmer to view information</p>
            )}
            {/* Add Field Modal */}
            {isAddFieldModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4 text-cream-600">Add New Field</h2>
                        <input
                            type="text"
                            placeholder="Enter field name"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.field_name}
                            onChange={(e) => setNewFieldData({ ...newFieldData, field_name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Enter state"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.state}
                            onChange={(e) => setNewFieldData({ ...newFieldData, state: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Enter city"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.city}
                            onChange={(e) => setNewFieldData({ ...newFieldData, city: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Enter address"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.address}
                            onChange={(e) => setNewFieldData({ ...newFieldData, address: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Enter zip"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.zip}
                            onChange={(e) => setNewFieldData({ ...newFieldData, zip: e.target.value })}
                        />
                        <input
                            type="number"
                            step="0.0000001"
                            placeholder="Enter latitude"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.latitude}
                            onChange={(e) => setNewFieldData({ ...newFieldData, latitude: e.target.value })}
                        />
                        <input
                            type="number"
                            step="0.0000001"
                            placeholder="Enter longitude"
                            className="w-full mb-2 p-2 border-2 border-cream-600 rounded-lg bg-cream-600 text-black"
                            value={newFieldData.longitude}
                            onChange={(e) => setNewFieldData({ ...newFieldData, longitude: e.target.value })}
                        />
                        <div className="flex justify-between space-x-2">
                            <button
                                onClick={handleAddField}
                                className="w-full bg-cream-500 text-brown-800 py-2 px-4 rounded hover:bg-white transition"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save New Field'}
                            </button>
                            <button
                                onClick={closeAddFieldModal}
                                className="w-full bg-cream-500 text-brown-800 py-2 px-4 rounded hover:bg-white transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Field Modal */}
            {isFieldModalOpen && selectedField && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-cream-500 p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4 text-brown-800">Field Information</h2>

                        <label className="block text-brown-800">Field Name</label>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.field_name}
                            onChange={(e) => setSelectedField({ ...selectedField, field_name: e.target.value })}
                        />

                        <label className="block text-brown-800">State</label>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.state}
                            onChange={(e) => setSelectedField({ ...selectedField, state: e.target.value })}
                        />

                        <label className="block text-brown-800">City</label>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.city}
                            onChange={(e) => setSelectedField({ ...selectedField, city: e.target.value })}
                        />

                        <label className="block text-brown-800">Address</label>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.address}
                            onChange={(e) => setSelectedField({ ...selectedField, address: e.target.value })}
                        />

                        <label className="block text-brown-800">Zip Code</label>
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.zip}
                            onChange={(e) => setSelectedField({ ...selectedField, zip: e.target.value })}
                        />

                        <label className="block text-brown-800">Latitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.latitude}
                            onChange={(e) => setSelectedField({ ...selectedField, latitude: e.target.value })}
                        />

                        <label className="block text-brown-800">Longitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            className="w-full mb-2 p-2 border-2 border-brown-600 rounded-lg bg-cream-600 text-brown-800"
                            value={selectedField.longitude}
                            onChange={(e) => setSelectedField({ ...selectedField, longitude: e.target.value })}
                        />

                        <div className="flex justify-between space-x-2">
                            <button
                                onClick={handleUpdateField}
                                className="bg-brown-800 text-white py-2 px-4 rounded hover:bg-brown-600 transition"
                            >
                                Update Field
                            </button>
                            <button
                                onClick={openDeleteConfirmation}
                                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                            >
                                Delete Field
                            </button>
                            <button
                                onClick={closeFieldModal}
                                className="bg-brown-600 text-white py-2 px-4 rounded hover:bg-brown-800 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmationOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
                        <p>All associated data with this field will also be deleted. This cannot be undone.</p>
                        <div className="flex justify-between space-x-2">
                            <button
                                onClick={handleDeleteField}
                                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={closeDeleteConfirmation}
                                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeftClientInfo;
