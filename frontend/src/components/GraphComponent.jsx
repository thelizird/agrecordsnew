import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import api from "../api"; // Axios instance for making API requests
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Register the required components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
);

function GraphComponent({ filters }) {
    const [graphDataList, setGraphDataList] = useState([]);
    const [farmerName, setFarmerName] = useState("");
    const [filterNames, setFilterNames] = useState({}); // Store names of selected fields/crops

    // Download the graphs as a long PDF, including non-visible content in the scrollable div
    const downloadPDF = () => {
        const input = document.getElementById("graph-container");

        // Temporarily remove the scrolling to capture all content
        const previousMaxHeight = input.style.maxHeight;
        const previousOverflow = input.style.overflowY;
        input.style.maxHeight = 'none';
        input.style.overflowY = 'visible';

        html2canvas(input, {
            scale: window.devicePixelRatio, // Ensures good resolution
            useCORS: true, // Ensures external resources like fonts/images are loaded
            logging: true, // For debugging purposes
            backgroundColor: "#ffffff", // Sets a white background to capture empty graphs
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Adjust height to maintain aspect ratio
            let heightLeft = imgHeight;
            let position = 0;

            // Add the first page
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add more pages if the content is larger than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the generated PDF
            pdf.save("graphs.pdf");

            // Reapply the scrollable behavior after capturing the screenshot
            input.style.maxHeight = previousMaxHeight;
            input.style.overflowY = previousOverflow;
        });
    };

    useEffect(() => {
        if (filters) {
            const fetchGraphData = async (filterValue) => {
                const queryParams = {
                    farmer: filters.farmer,
                    field: filterValue,
                    date_after: filters.startDate,
                    date_before: filters.endDate,
                };

                // Choose endpoint based on viewType
                const endpoint = filters.viewType === "yields" ? "/api/yields/" : "/api/soiltests/";
                const res = await api.get(endpoint, { params: queryParams });
                return res.data;
            };

            const fetchAllData = async () => {
                const graphDataResults = await Promise.all(filters.filterValues.map(fetchGraphData));

                const allGraphData = graphDataResults.map((data, index) => {
                    const filterValue = filters.filterValues[index];
                    
                    // Handle different data structure for yields vs soil tests
                    if (filters.viewType === "yields") {
                        return {
                            labels: data.map((item) => item.date),
                            datasets: [{
                                label: 'Yield',
                                data: data.map((item) => item.yield_number),
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                fill: false,
                                tension: 0.1,
                            }],
                            filterValue,
                        };
                    } else {
                        // Existing soil test data handling
                        const datasets = filters.selectedFields.map((field) => {
                            const color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                                Math.random() * 255
                            )}, ${Math.floor(Math.random() * 255)}, 0.6)`;

                            return {
                                label: field,
                                data: data.map((test) => test[field]),
                                backgroundColor: color,
                                borderColor: color,
                                fill: false,
                                tension: 0.1,
                            };
                        });

                        return {
                            labels: data.map((test) => test.test_date),
                            datasets,
                            filterValue,
                        };
                    }
                });

                setGraphDataList(allGraphData);
            };

            fetchAllData();

            api
                .get(`/api/farmers/${filters.farmer}/`)
                .then((res) => setFarmerName(`${res.data.farmer_fname} ${res.data.farmer_lname}`))
                .catch((error) => console.error("Failed to fetch farmer name:", error));

            filters.filterValues.forEach((filterValue) => {
                if (filters.filterType === "field") {
                    api
                        .get(`/api/fields/${filterValue}/`)
                        .then((res) => setFilterNames((prevNames) => ({
                            ...prevNames,
                            [filterValue]: res.data.field_name,
                        })))
                        .catch((error) => console.error("Failed to fetch field name:", error));
                } else if (filters.filterType === "crop") {
                    api
                        .get(`/api/crops/${filterValue}/`)
                        .then((res) => setFilterNames((prevNames) => ({
                            ...prevNames,
                            [filterValue]: res.data.crop_name,
                        })))
                        .catch((error) => console.error("Failed to fetch crop name:", error));
                }
            });
        }
    }, [filters]);

    if (!graphDataList.length) {
        return <p className="text-center">No data to display. Adjust your filters and try again.</p>;
    }

    return (
        <div className="relative">
            {/* Graph container with single scrollbar */}
            <div id="graph-container" className="p-4 bg-white rounded-lg shadow-lg mt-6 max-h-[600px] overflow-y-auto">
                {/* Overlay green box inside the graph container */}
                <div className="absolute top-4 right-4 bg-green-500 text-white p-3 rounded cursor-pointer z-10" onClick={downloadPDF}>
                    Save Graphs
                </div>

                {graphDataList.map((graphData, index) => {
                    const titleText = `Data for ${farmerName} on ${filters.filterType === "field" ? "Field" : "Crop"} ${filterNames[graphData.filterValue] || "Loading..."}`;

                    return (
                        <div key={index} className="mb-6">
                            {filters.graphType === "bar" ? (
                                <Bar
                                    data={graphData}
                                    options={{
                                        plugins: {
                                            title: {
                                                display: true,
                                                text: titleText,
                                                font: {
                                                    size: 18,
                                                },
                                            },
                                        },
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: "Test Date",
                                                },
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: "Values",
                                                },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Line
                                    data={graphData}
                                    options={{
                                        plugins: {
                                            title: {
                                                display: true,
                                                text: titleText,
                                                font: {
                                                    size: 18,
                                                },
                                            },
                                        },
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: "Test Date",
                                                },
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: "Values",
                                                },
                                            },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default GraphComponent;