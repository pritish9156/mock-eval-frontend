import React from "react";
import "./Dashboard.css";
import { 
  FaUsers, 
  FaLayerGroup, 
  FaCode, 
  FaChartBar,
  FaClipboardList,
  FaTasks,
  FaFileAlt
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">

        {/* 🔥 TOP SECTION */}
        <div className="sidebar-top">
          <h2>MockEval</h2>

          <ul>
            <li className="active"><FaChartBar /> Dashboard</li>
            <li><FaUsers /> Users</li>
            <li><FaLayerGroup /> Batch</li>
            <li><FaCode /> Technology</li>
            <li><FaClipboardList /> Assignments</li>
            <li><FaTasks /> Evaluations</li>
            <li><FaFileAlt /> Reports</li>
          </ul>
        </div>

        {/* 🔥 BOTTOM SECTION */}
        <div className="sidebar-bottom">

          <div className="profile">
            <div className="avatar">A</div>
            <div>
              <p className="name">Admin</p>
              <span className="role">ADMIN</span>
            </div>
          </div>

          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Logout
          </button>

        </div>

      </div>

      {/* Main */}
      <div className="main">

        <div className="topbar">
          <h3>Dashboard</h3>
        </div>

        <div className="cards">

          <div className="card">
            <h4>Total Users</h4>
            <p>120</p>
          </div>

          <div className="card">
            <h4>Evaluations</h4>
            <p>75</p>
          </div>

          <div className="card">
            <h4>Batches</h4>
            <p>8</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;