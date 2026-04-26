import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>MockEval</h2>

        <ul>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Batch</li>
          <li>Technology</li>
          <li>Assignments</li>
          <li>Evaluations</li>
          <li>Reports</li>
        </ul>
      </div>

      {/* Main Content */}
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