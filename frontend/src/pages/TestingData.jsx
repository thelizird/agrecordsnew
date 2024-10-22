import { useState, useEffect } from "react";
import api from "../api"; // Axios instance for making API requests

function TestingData() {
  const [selectedTable, setSelectedTable] = useState("labs"); // Set default table to Labs
  const [data, setData] = useState([]); // Store table data
  const [loading, setLoading] = useState(false); // Track loading state

  // Fetch data from the selected table
  const fetchData = async (table) => {
    setLoading(true);
    try {
      let response;
      if (table === "labs") {
        response = await api.get("/api/labs/"); // Fetch Labs data
      } else if (table === "crops") {
        response = await api.get("/api/crops/"); // Fetch Crops data
      } else if (table === "fieldhistory") {  // Handle FieldHistory
        response = await api.get("/api/fieldhistory/");
      }
      setData(response.data);
    } catch (error) {
      console.error(`Failed to fetch data from ${table}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever the selected table changes
  useEffect(() => {
    fetchData(selectedTable);
  }, [selectedTable]);

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-xl font-bold mb-4">View Data</h1>

      {/* Dropdown to select table */}
      <div className="mb-4">
        <label htmlFor="table-select" className="mr-2">Select Table:</label>
        <select
          id="table-select"
          className="p-2 border-2 border-brown-600 rounded-lg"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="labs">Labs</option>
          <option value="crops">Crops</option>
          <option value="fieldhistory">Field History</option>
        </select>
      </div>

      {/* Display data in a table */}
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-cream-500 text-brown-800 border border-brown-800">
            <thead>
              <tr>
                {/* Adjust table headers based on selected table */}
                {selectedTable === "labs" && (
                  <>
                    <th className="px-4 py-2 border-b border-brown-600">Lab ID</th>
                    <th className="px-4 py-2 border-b border-brown-600">Lab Name</th>
                    <th className="px-4 py-2 border-b border-brown-600">Farmer ID</th>
                  </>
                )}
                {selectedTable === "crops" && (
                  <>
                    <th className="px-4 py-2 border-b border-brown-600">Crop ID</th>
                    <th className="px-4 py-2 border-b border-brown-600">Crop Name</th>
                    <th className="px-4 py-2 border-b border-brown-600">Farmer ID</th>
                  </>
                )}
                {selectedTable === "fieldhistory" && (
                  <>
                    <th className="px-4 py-2 border-b border-brown-600">Field History ID</th>
                    <th className="px-4 py-2 border-b border-brown-600">Field</th>
                    <th className="px-4 py-2 border-b border-brown-600">Crop</th>
                    <th className="px-4 py-2 border-b border-brown-600">Plant Date</th>
                    <th className="px-4 py-2 border-b border-brown-600">Harvest Date</th>
                    <th className="px-4 py-2 border-b border-brown-600">Yield Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Display data rows */}
              {data.map((item) => (
                <tr key={selectedTable === "labs" ? item.lab_id : item.crop_id}>
                  {selectedTable === "labs" && (
                    <>
                      <td className="px-4 py-2 border-b border-brown-600">{item.lab_id}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.lab_name}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.farmer}</td>
                    </>
                  )}
                  {selectedTable === "crops" && (
                    <>
                      <td className="px-4 py-2 border-b border-brown-600">{item.crop_id}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.crop_name}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.farmer}</td>
                    </>
                  )}
                  {selectedTable === "fieldhistory" && (
                    <>
                      <td className="px-4 py-2 border-b border-brown-600">{item.field_hist_id}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.field}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.crop}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.plant_date}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.harvest_date}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.yield_amount}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TestingData;