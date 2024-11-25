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
  const [userRole, setUserRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get("/api/user/me/");
        console.log("User data response:", response.data);
        setUserRole(response.data.role);
        setCompanyId(response.data.company);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch farmers from the API
  const fetchClients = async () => {
    try {
      const response = await api.get("/api/farmers/");
      console.log("Farmers data:", response.data);
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
      alert("Failed to fetch farmers.");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  // Only show "Add Farmers" button for company users
  const showAddButton = userRole === 'COMPANY';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPage} />

      <div className="flex flex-1">
        <LeftClientInfo 
          selectedClient={selectedClient} 
          fetchClients={fetchClients}
        />

        <div className="w-3/4 flex flex-col">
          {showAddButton && (
            // <div className="p-5">
              <div className="flex-0 h-[10%] bg-white shadow-md my-5 mx-5 rounded-lg flex justify-center items-center">

              <button
                onClick={() => setIsModalOpen(true)}
                className="text-brown-800 text-[20px] font-bold"
              >
                Add Farmers +
              </button>
            </div>
            // </div>
          )}

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