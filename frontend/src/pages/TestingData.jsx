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
      } else if (table === "yields") {  // Add yields case
        response = await api.get("/api/yields/");
      } else if (table === "farmers") {  // Add farmers case
        response = await api.get("/api/farmers/");
      } else if (table === "fields") {   // Add fields case
        response = await api.get("/api/fields/");
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
          <option value="farmers">Farmers</option>
          <option value="fields">Fields</option>
          <option value="labs">Labs</option>
          <option value="crops">Crops</option>
          <option value="fieldhistory">Field History</option>
          <option value="yields">Yields</option>
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
                {/* Add farmers headers */}
                {selectedTable === "farmers" && (
                  <>
                    <th className="px-4 py-2 border-b border-brown-600">ID</th>
                    <th className="px-4 py-2 border-b border-brown-600">First Name</th>
                    <th className="px-4 py-2 border-b border-brown-600">Last Name</th>
                    <th className="px-4 py-2 border-b border-brown-600">User</th>
                  </>
                )}
                {/* Add fields headers */}
                {selectedTable === "fields" && (
                  <>
                    <th className="px-4 py-2 border-b border-brown-600">Field ID</th>
                    <th className="px-4 py-2 border-b border-brown-600">Field Name</th>
                    <th className="px-4 py-2 border-b border-brown-600">Farmer</th>
                    <th className="px-4 py-2 border-b border-brown-600">State</th>
                    <th className="px-4 py-2 border-b border-brown-600">City</th>
                    <th className="px-4 py-2 border-b border-brown-600">Address</th>
                    <th className="px-4 py-2 border-b border-brown-600">ZIP</th>
                    <th className="px-4 py-2 border-b border-brown-600">Latitude</th>
                    <th className="px-4 py-2 border-b border-brown-600">Longitude</th>
                  </>
                )}
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
                {selectedTable === "yields" && (
                  <>
                    <th className="px-4 py-2 border-b border-brown-600">ID</th>
                    <th className="px-4 py-2 border-b border-brown-600">Farmer</th>
                    <th className="px-4 py-2 border-b border-brown-600">Field</th>
                    <th className="px-4 py-2 border-b border-brown-600">Date</th>
                    <th className="px-4 py-2 border-b border-brown-600">Yield Number</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Display data rows */}
              {data.map((item) => (
                <tr key={
                  selectedTable === "labs" ? item.lab_id : 
                  selectedTable === "crops" ? item.crop_id :
                  selectedTable === "yields" ? item.id :
                  selectedTable === "fields" ? item.field_id :
                  selectedTable === "farmers" ? item.id :
                  item.field_hist_id
                }>
                  {/* Add farmers data rows */}
                  {selectedTable === "farmers" && (
                    <>
                      <td className="px-4 py-2 border-b border-brown-600">{item.id}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.farmer_fname}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.farmer_lname}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.user}</td>
                    </>
                  )}
                  {/* Add fields data rows */}
                  {selectedTable === "fields" && (
                    <>
                      <td className="px-4 py-2 border-b border-brown-600">{item.field_id}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.field_name}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.farmer}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.state}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.city}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.address}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.zip}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.latitude}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.longitude}</td>
                    </>
                  )}
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
                  {selectedTable === "yields" && (
                    <>
                      <td className="px-4 py-2 border-b border-brown-600">{item.id}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.farmer}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.field}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.date}</td>
                      <td className="px-4 py-2 border-b border-brown-600">{item.yield_number}</td>
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