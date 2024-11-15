// Clients.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import ClientList from "../components/ClientList";
import LeftClientInfo from "../components/LeftClientInfo";
import UserFormModal from "../components/UserFormModal";
import api from "../api";

function Clients() {
  const [currentPage, setCurrentPage] = useState('clients');
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  // Fetch company ID when component mounts
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const response = await api.get("/api/user/me/");
        setCompanyId(response.data.company);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchCompanyId();
  }, []);

  // Fetch clients (farmers) from the API
  const fetchClients = () => {
    api.get("/api/farmers/")
      .then((res) => setClients(res.data))
      .catch((err) => alert("Failed to fetch clients."));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPage} />

      <div className="flex flex-1">
        <LeftClientInfo 
          selectedClient={selectedClient} 
          fetchClients={fetchClients}
        />

        <div className="w-3/4 flex flex-col">
          <div className="p-5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="mb-4 bg-brown-800 text-white px-4 py-2 rounded hover:bg-brown-600 transition"
            >
              Add Farmers
            </button>
          </div>
          <ClientList 
            clients={clients} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onClientClick={handleClientClick}
          />
        </div>
      </div>

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClients}
        companyId={companyId}
      />
    </div>
  );
}

export default Clients;