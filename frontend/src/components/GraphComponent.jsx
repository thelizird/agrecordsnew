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
                    ...(filters.startDate && { date_after: filters.startDate }),
                    ...(filters.endDate && { date_before: filters.endDate }),
                };

                if (filters.viewType === "yields") {
                    console.log("Fetching yields with params:", queryParams);
                    const res = await api.get("/api/yields/", { params: queryParams });
                    
                    // Add strict filtering on the frontend as well
                    const validData = res.data.filter(item => {
                        const date = new Date(item.date);
                        return (
                            !isNaN(date) && 
                            item.yield_number != null &&
                            item.farmer.toString() === filters.farmer.toString() &&
                            item.field.toString() === filterValue.toString() &&
                            (!filters.startDate || date >= new Date(filters.startDate)) &&
                            (!filters.endDate || date <= new Date(filters.endDate))
                        );
                    });
                    
                    console.log("Strictly filtered yield data:", validData);
                    
                    return {
                        data: validData,
                        filterValue,
                    };
                } else {
                    // Fetch only soil test data
                    const res = await api.get("/api/soiltests/", { params: queryParams });
                    return {
                        data: res.data,
                        filterValue,
                    };
                }
            };

            const fetchAllData = async () => {
                const graphDataResults = await Promise.all(filters.filterValues.map(fetchGraphData));

                const allGraphData = graphDataResults.map((result) => {
                    const { data, filterValue } = result;
                    
                    if (filters.viewType === "yields") {
                        // Create a single dataset for yields
                        return {
                            labels: data.map(item => new Date(item.date).toLocaleDateString()),
                            datasets: [{
                                label: `Yield for ${filterNames[filterValue] || 'Loading...'}`,
                                data: data.map(item => parseFloat(item.yield_number)),
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                fill: false,
                                tension: 0.1,
                            }],
                            filterValue,
                        };
                    } else {
                        // Handle soil test data with multiple datasets
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

            // Fetch farmer name
            api.get(`/api/farmers/${filters.farmer}/`)
                .then((res) => setFarmerName(`${res.data.farmer_fname} ${res.data.farmer_lname}`))
                .catch((error) => console.error("Failed to fetch farmer name:", error));

            // Fetch field names
            filters.filterValues.forEach((filterValue) => {
                api.get(`/api/fields/${filterValue}/`)
                    .then((res) => setFilterNames((prevNames) => ({
                        ...prevNames,
                        [filterValue]: res.data.field_name,
                    })))
                    .catch((error) => console.error("Failed to fetch field name:", error));
            });
        }
    }, [filters]);

    if (!graphDataList.length) {
        return <p className="text-center">No data to display. Adjust your filters and try again.</p>;
    }

    return (
        <div className="relative">
            <div id="graph-container" className="p-4 bg-white rounded-lg shadow-lg mt-6 max-h-[600px] overflow-y-auto">
                <div className="absolute top-4 right-4 bg-green-500 text-white p-3 rounded cursor-pointer z-10" onClick={downloadPDF}>
                    Save Graphs
                </div>

                {graphDataList.map((graphData, index) => {
                    const titleText = filters.viewType === "yields" 
                        ? `Yield Data for ${farmerName} - ${filterNames[graphData.filterValue] || "Loading..."}`
                        : `Soil Test Data for ${farmerName} - ${filterNames[graphData.filterValue] || "Loading..."}`;

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
                                                font: { size: 18 },
                                            },
                                        },
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: filters.viewType === "yields" ? "Date" : "Test Date",
                                                },
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: filters.viewType === "yields" ? "Yield Amount" : "Values",
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
                                                font: { size: 18 },
                                            },
                                        },
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: filters.viewType === "yields" ? "Date" : "Test Date",
                                                },
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: filters.viewType === "yields" ? "Yield Amount" : "Values",
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