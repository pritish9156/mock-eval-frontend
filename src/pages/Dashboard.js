import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
    const location = useLocation(); 

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">

        {/* 🔥 TOP SECTION */}
        <div className="sidebar-top">
          <h2>MockEval</h2>

          <ul>
            <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/"><FaChartBar /> Dashboard</Link>
            </li>

            <li className={location.pathname === "/users" ? "active" : ""}>
                <Link to="/users"><FaUsers /> Users</Link>
            </li>

            <li className={location.pathname === "/batch" ? "active" : ""}>
                <Link to="/batch"><FaLayerGroup /> Batch</Link>
            </li>

            <li className={location.pathname === "/technology" ? "active" : ""}>
                <Link to="/technology"><FaCode /> Technology</Link>
            </li>

            <li className={location.pathname === "/assignments" ? "active" : ""}>
                <Link to="/assignments"><FaClipboardList /> Assignments</Link>
            </li>

            <li className={location.pathname === "/evaluations" ? "active" : ""}>
                <Link to="/evaluations"><FaTasks /> Evaluations</Link>
            </li>

            <li className={location.pathname === "/reports" ? "active" : ""}>
                <Link to="/reports"><FaFileAlt /> Reports</Link>
            </li>
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

        {location.pathname === "/" ? (
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
            ) : (
            <Outlet />
        )}

      </div>

    </div>
  );
};

export default Dashboard;