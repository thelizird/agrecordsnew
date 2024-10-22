// ClientFormModal.jsx
function ClientFormModal({
    farmer_fname, setFarmerFname, farmer_lname, setFarmerLname, handleSubmit, toggleModal, loading, error
}) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-auto z-50">
                <h2 className="text-xl font-bold mb-4">Add a New Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">First Name</label>
                        <input
                            type="text"
                            value={farmer_fname}
                            onChange={(e) => setFarmerFname(e.target.value)}
                            required
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Last Name</label>
                        <input
                            type="text"
                            value={farmer_lname}
                            onChange={(e) => setFarmerLname(e.target.value)}
                            required
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={toggleModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-brown-800 text-white rounded-lg hover:bg-brown-700 transition ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Adding...' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClientFormModal;