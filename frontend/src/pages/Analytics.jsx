import { useState } from "react";
import Header from "../components/Header";
import AddLabModal from "../components/AddLabModal";
import AddCropModal from "../components/AddCropModal";
import FieldHistoryModal from "../components/FieldHistoryModal";
import AddSoilTestModal from "../components/AddSoilTestModal";
import FilterComponent from "../components/FilterComponent";
import GraphComponent from "../components/GraphComponent";

function Home() {
  const [currentPage, setCurrentPage] = useState("analytics");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddLabModalOpen, setIsAddLabModalOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [isAddFieldHistoryModalOpen, setIsAddFieldHistoryModalOpen] = useState(false);
  const [isAddSoilTestModalOpen, setIsAddSoilTestModalOpen] = useState(false);
  const [graphFilters, setGraphFilters] = useState(null); // Graph filter data

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleAddLabModal = () => setIsAddLabModalOpen(!isAddLabModalOpen);
  const toggleAddCropModal = () => setIsAddCropModalOpen(!isAddCropModalOpen);
  const toggleAddFieldHistoryModal = () => setIsAddFieldHistoryModalOpen(!isAddFieldHistoryModalOpen);
  const toggleAddSoilTestModal = () => setIsAddSoilTestModalOpen(!isAddSoilTestModalOpen);

  const handleGenerateGraph = (filters) => {
    setGraphFilters(filters); // Pass filters to GraphComponent
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPage} />
      <div className={`flex flex-1 ${isModalOpen ? "blur-sm" : ""}`}>
        {/* Left section: Filter options */}
        <div className="w-1/4 bg-cream-500 rounded-lg my-5 mx-5">
          <FilterComponent onGenerateGraph={handleGenerateGraph} />
        </div>

        {/* Right section: Graph */}
        <div className="w-3/4 flex flex-col">
          <div className="flex-0 h-[10%] bg-white shadow-md my-5 mx-5 rounded-lg flex justify-center items-center">
            <button onClick={toggleModal}>
              <span className="text-brown-800 text-[20px] font-bold">Add Data +</span>
            </button>
          </div>
          <div className="flex-1 bg-white">
            <GraphComponent filters={graphFilters} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-brown-800 p-6 rounded-lg shadow-lg w-[400px] z-50">
            <h2 className="text-xl font-bold mb-4 text-white">Add Data</h2>
            <div className="grid grid-cols-1 gap-4">
              <button className="w-full font-bold bg-white text-green-500 py-2 px-4 rounded-lg hover:bg-cream-500" onClick={() => { toggleModal(); toggleAddLabModal(); }}>Add Lab</button>
              <button className="w-full font-bold bg-white text-green-500 py-2 px-4 rounded-lg hover:bg-cream-500" onClick={() => { toggleModal(); toggleAddCropModal(); }}>Add Crop</button>
              <button className="w-full font-bold bg-white text-green-500 py-2 px-4 rounded-lg hover:bg-cream-500" onClick={() => { toggleModal(); toggleAddFieldHistoryModal(); }}>Add Field History</button>
              <button className="w-full font-bold bg-white text-green-500 py-2 px-4 rounded-lg hover:bg-cream-500" onClick={() => { toggleModal(); toggleAddSoilTestModal(); }}>Add Soil Test</button>
            </div>
            <button onClick={toggleModal} className="mt-4 px-4 py-2 bg-gray-300 text-black rounded-lg w-full">Close</button>
          </div>
        </div>
      )}

      {/* Add Data Modals */}
      <AddLabModal isOpen={isAddLabModalOpen} onClose={toggleAddLabModal} />
      <AddCropModal isOpen={isAddCropModalOpen} onClose={toggleAddCropModal} />
      <FieldHistoryModal isOpen={isAddFieldHistoryModalOpen} onClose={toggleAddFieldHistoryModal} />
      <AddSoilTestModal isOpen={isAddSoilTestModalOpen} onClose={toggleAddSoilTestModal} />
    </div>
  );
}

export default Home;