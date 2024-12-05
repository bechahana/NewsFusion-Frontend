import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import './Analytics.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics data");
        const data = await response.json();
  
        console.log("Raw Analytics Data:", data); // Log raw API response
  
        // Extract unique dates
        const dates = data.map((row) => row.date);
        console.log("Unique Dates:", dates); // Log unique dates
  
        // Extract reads and writes for each date
        const reads = data.map((row) => row.reads);
        const writes = data.map((row) => row.writes);
        console.log("Reads:", reads); // Log reads array
        console.log("Writes:", writes); // Log writes array
  
        // Set chart data
        setChartData({
          labels: dates,
          datasets: [
            {
              label: "Reads",
              data: reads,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.3,
            },
            {
              label: "Writes",
              data: writes,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.3,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Unable to load analytics data. Please try again later.");
      }
    };
  
    fetchAnalytics();
  }, []);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Use custom legend
      },
      tooltip: {
        backgroundColor: "#f5f5f5",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ccc",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
          borderDash: [5, 5],
        },
        ticks: {
          color: "#555",
        },
      },
      y: {
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
          borderDash: [5, 5],
        },
        ticks: {
          color: "#555",
        },
      },
    },
  };

  const CustomLegend = ({ datasets }) => (
    <div className="legend-container">
      {datasets.map((dataset, index) => (
        <div
          key={index}
          className="legend-item"
          style={{ color: dataset.borderColor }}
        >
          ● {dataset.label}
        </div>
      ))}
    </div>
  );

  if (error) return <p className="error">{error}</p>;
  if (!chartData) return <p className="loader">Loading...</p>;

  return (
    <div className="analytics">
      <div className="chart-container">
        <CustomLegend datasets={chartData.datasets} />
        <div style={{ width: "90%", height: "400px", margin: "0 auto" }}>
          <Line data={chartData} options={options} />
        </div>
        <div className="chart-title">Reads and Writes Over Time </div>
      </div>

      <div className="chart-container">
        <CustomLegend datasets={chartData.datasets} />
        <div style={{ width: "90%", height: "400px", margin: "0 auto" }}>
          <Bar data={chartData} options={options} />
        </div>
        <div className="chart-title">Reads and Writes Over Time</div>
      </div>
    </div>
  );
};

export default Analytics;
