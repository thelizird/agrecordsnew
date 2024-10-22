// Clients.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import ClientFormModal from "../components/ClientFormModal"; // ClientFormModal component
import ClientList from "../components/ClientList"; // ClientList component
import LeftClientInfo from "../components/LeftClientInfo"; // LeftClientInfo component
import api from "../api"; // Import the existing Axios instance

function Clients() {
  const [currentPage, setCurrentPage] = useState('clients'); // Set the default active page
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [clients, setClients] = useState([]); // Store the list of clients
  const [searchQuery, setSearchQuery] = useState(''); // Track search input
  const [selectedClient, setSelectedClient] = useState(null); // Selected client state

  // Form state
  const [farmer_fname, setFarmerFname] = useState('');
  const [farmer_lname, setFarmerLname] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); // Track errors

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setFarmerFname('');
      setFarmerLname('');
      setError(null);
    }
  };

  // Fetch clients (farmers) from the API
  const fetchClients = () => {
    api.get("/api/farmers/")  // Updated to fetch from farmers endpoint
      .then((res) => setClients(res.data))
      .catch((err) => alert("Failed to fetch clients."));
  };

  // Fetch clients when the component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'))?.id || 1;  // Get the user ID
    const payload = { farmer_fname, farmer_lname, user };

    api.post("/api/farmers/", payload)  // Updated endpoint
      .then((res) => {
        if (res.status === 201) {
          setClients([...clients, res.data]);
          toggleModal(); // Close modal
        } else {
          alert("Failed to create client.");
        }
      })
      .catch((err) => setError("An unexpected error occurred."))
      .finally(() => setLoading(false));
  };

  // Handle selecting a client to view details
  const handleClientClick = (client) => {
    setSelectedClient(client); // Set the selected client
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPage} />

      <div className={`flex flex-1 ${isModalOpen ? 'blur-sm' : ''}`}>
        {/* Left Div: Client Information */}

        <LeftClientInfo 
          selectedClient={selectedClient} 
          fetchClients={fetchClients} // Pass the fetchClients function to update the client list
        />

        {/* Right Div: Client List and Add Client Button */}
        <div className="w-3/4 flex flex-col">
          {/* Top Div: Add Client Button */}
          <div className="flex-0 h-[10%] bg-white shadow-md my-5 mx-5 rounded-lg flex justify-center items-center">
            <button onClick={toggleModal} className="px-4 py-2 text-white rounded-lg hover:bg-brown-700 transition">
              <span className="text-brown-800 text-[20px] font-bold">Add A New Client +</span>
            </button>
          </div>

          {/* Client List Component */}
          <ClientList 
            clients={clients} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onClientClick={handleClientClick} // Pass the click handler to ClientList
          />
        </div>
      </div>

      {/* Client Form Modal */}
      {isModalOpen && (
        <ClientFormModal
          farmer_fname={farmer_fname}
          setFarmerFname={setFarmerFname}
          farmer_lname={farmer_lname}
          setFarmerLname={setFarmerLname}
          handleSubmit={handleSubmit}
          toggleModal={toggleModal}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}

export default Clients;