import React, { useState, useEffect } from "react";
import { FaBox, FaListAlt, FaMapMarkerAlt, FaBarcode, FaCalculator, FaTruckLoading, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SidePanel = () => {
  const [statistics, setStatistics] = useState({
    parcelsCount: 0,
    trucksCount: 0,
    postOfficesCount: 0,
    statusCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics data
  const fetchStatistics = async () => {
    const API = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/statistics`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(API, params);
      const data = await response.json();

      if (data && data.data) {
        setStatistics(data.data);
      } else {
        toast.error("Invalid data format received.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const chartData = {
    labels: ["Parcels", "Post Offices", "Parcel Statuses"],
    datasets: [
      {
        label: "Count",
        data: [
          statistics.parcelsCount,
        //   statistics.trucksCount,
          statistics.postOfficesCount,
          statistics.statusCount,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ffeb3b"],
        borderColor: ["#388e3c", "#d32f2f", "#fbc02d"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "System Statistics",
      },
    },
  };

  return (
    <>
      {/* Side Panel */}
      <div style={sidePanelStyle}>
        {/* Profile Section */}
        <div style={profileStyle}>
          <FaUserCircle style={profileIconStyle} />
          <h2 style={{ color: "white", fontSize: "18px" }}>User</h2>
        </div>

        {/* Navigation Links */}
        {links.map((link, index) => (
          <a key={index} href={`#${link.id}`} style={linkStyle}>
            <link.icon style={{ marginRight: "10px" }} />
            {link.title}
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: "260px", padding: "20px" }}>
        {/* Feature Blocks */}
        <div style={bodyStyle}>
          {featureBlocks.map((feature, index) => (
            <div key={index} style={blockStyle} id={feature.id}>
              <feature.icon style={iconStyle} />
              <h3>{feature.title}</h3>
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="container my-4" style={{ marginTop: "32px" }}>
          <h1>Parcel Statistics</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              
              <div className="row">
                <div className="col-md-3">
                  <div className="card p-3">
                    <h5>Parcels</h5>
                    <p>{statistics.parcelsCount}</p>
                  </div>
                </div>
                <div className="col-md-3">
              <div className="card p-3">
                <h5>Post Offices</h5>
                <p>{statistics.postOfficesCount}</p>
              </div>
             </div>
                <div className="col-md-3">
                  <div className="card p-3">
                    <h5>Parcel Statuses</h5>
                    <p>{statistics.statusCount}</p>
                  </div>
                </div>
              </div>

              {/* <h3 className="my-4">Graphical Representation</h3>
              <div style={{ height: "400px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div> */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Styling for the side panel
const sidePanelStyle = {
  height: "100%",
  width: "250px",
  position: "fixed",
  top: "0",
  left: "0",
  backgroundColor: "black",
  overflowX: "hidden",
  paddingTop: "20px",
};

// Profile section styling
const profileStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "20px",
};

const profileIconStyle = {
  fontSize: "50px",
  color: "white",
  marginBottom: "10px",
};

// Styling for links
const linkStyle = {
  padding: "10px 15px",
  textDecoration: "none",
  fontSize: "18px",
  color: "white",
  display: "flex",
  alignItems: "center",
  transition: "0.3s",
};

const bodyStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)", // Three blocks per row
  gap: "20px",
  justifyContent: "center",
  marginTop: "120px",
};

// Styling for each block
const blockStyle = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #ddd",
  borderRadius: "10px",
  textAlign: "center",
  padding: "20px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s",
  cursor: "pointer",
};

const iconStyle = {
  fontSize: "40px",
  color: "darkred",
  marginBottom: "10px",
};

// Navigation links data
const links = [
  { id: "add-parcel", title: "Add Parcel", icon: FaBox },
  { id: "view-all-parcel", title: "View All Parcel", icon: FaListAlt },
  { id: "locate-post-office", title: "Locate Post Office", icon: FaMapMarkerAlt },
  { id: "scan-parcel", title: "Scan Parcel Details", icon: FaBarcode },
  { id: "calculate-postage", title: "Calculate Postage", icon: FaCalculator },
  { id: "add-to-truck", title: "Add Parcels to Truck", icon: FaTruckLoading },
];

const featureBlocks = links;

export default SidePanel;
