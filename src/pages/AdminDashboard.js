import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";

const AdminDashboard = () => {

  const [data, setData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const safeFetch = (url, setter) => {
      fetch(url, { headers })
        .then(res => res.ok ? res.json() : [])
        .then(setter)
        .catch(() => {});
    };

    safeFetch("http://localhost:8080/evaluation", setData);
    safeFetch("http://localhost:8080/assignment", setAssignments);

  }, []);

  // 🔍 FILTER
  const filteredData = selectedBatch
    ? data.filter(e => e.assignment?.participant?.batch?.name === selectedBatch)
    : data;

  // 📊 BASIC
  const totalStudents = new Set(
    filteredData.map(e => e.assignment?.participant?.name)
  ).size;

  const avgScore = filteredData.length
    ? (filteredData.reduce((a,b)=>a+(b.score||0),0)/filteredData.length).toFixed(1)
    : 0;

  const weakCount = filteredData.filter(e => (e.score || 0) < 5).length;

  // ✅ CORRECT PENDING LOGIC
  // 📦 FINAL SAFE LOGIC
  console.log("Assignments:", assignments);
  const completed = data.length;

  const totalAssignments = assignments.length + data.length;

  const pending = totalAssignments - completed;

  // 📊 PIE DATA
  const pieData = [
    { name: "High", value: filteredData.filter(e => e.score >= 7).length },
    { name: "Medium", value: filteredData.filter(e => e.score >= 4 && e.score < 7).length },
    { name: "Low", value: filteredData.filter(e => e.score < 4).length }
  ];

  const COLORS = ["#22c55e","#facc15","#ef4444"];

  // 📊 TECHNOLOGY
  const techMap = {};
  filteredData.forEach(e => {
    const tech = e.assignment?.technology?.name || "Unknown";

    if (!techMap[tech]) techMap[tech] = { total: 0, count: 0 };

    techMap[tech].total += e.score || 0;
    techMap[tech].count++;
  });

  const techData = Object.keys(techMap).map(t => ({
    name: t,
    avg: (techMap[t].total / techMap[t].count).toFixed(1)
  }));

  // 📊 BATCH
  const batchData = Object.values(
    filteredData.reduce((acc, e) => {
      const b = e.assignment?.participant?.batch?.name || "Unknown";
      acc[b] = acc[b] || { name: b, total: 0, count: 0 };
      acc[b].total += e.score || 0;
      acc[b].count++;
      return acc;
    }, {})
  ).map(b => ({
    name: b.name,
    avg: (b.total / b.count).toFixed(1)
  }));

  const topBatch = batchData.sort((a,b)=>b.avg-a.avg)[0]?.name || "-";

  // 🏆 LEADERBOARD
  const leaderboard = [...filteredData]
    .sort((a,b)=>b.score-a.score)
    .slice(0,5);

  const batchList = [...new Set(
    data.map(e => e.assignment?.participant?.batch?.name).filter(Boolean)
  )];

  return (
    <div className="admin-dashboard">

      <h2>📊 Admin Analytics</h2>

      {/* 🔥 FILTER */}
      <div className="admin-filters">
        <select value={selectedBatch} onChange={(e)=>setSelectedBatch(e.target.value)}>
          <option value="">All Batches</option>
          {batchList.map((b,i)=>(
            <option key={i}>{b}</option>
          ))}
        </select>

        <button onClick={()=>setSelectedBatch("")}>Reset</button>
      </div>

      {/* 🔹 CARDS */}
      <div className="admin-cards">

        <motion.div className="admin-card" whileHover={{scale:1.05}}>
          <h4>Total Students</h4>
          <p>{totalStudents}</p>
        </motion.div>

        <motion.div className="admin-card" whileHover={{scale:1.05}}>
          <h4>Overall Score</h4>
          <p>{avgScore}</p>
        </motion.div>

        <motion.div className="admin-card" whileHover={{scale:1.05}}>
          <h4>Weak Students</h4>
          <p>{weakCount}</p>
        </motion.div>

        <motion.div className="admin-card" whileHover={{scale:1.05}}>
          <h4>Top Batch</h4>
          <p>{topBatch}</p>
        </motion.div>

      </div>

      {/* 📦 ASSIGNMENTS */}
      <div className="admin-section">
        <h3>📦 Assignment Status</h3>

        <div className="admin-cards">
          <div className="admin-card green">
            <h4>Completed</h4>
            <p>{completed}</p>
          </div>

          <div className="admin-card red">
            <h4>Pending</h4>
            <p>{pending}</p>
          </div>
        </div>
      </div>

      {/* 📊 CHARTS */}
      <div className="admin-section">
        <h3>📊 Insights</h3>

        <div className="admin-charts">

          {/* PIE */}
          <div className="admin-chart">
            <h4>Score Distribution</h4>

            <PieChart width={300} height={260}>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>

              <Tooltip formatter={(value, name) => [`${value}`, name]} />

              <Legend formatter={(value, entry, index) =>
                `${value} (${pieData[index].value})`
              }/>
            </PieChart>
          </div>

          {/* BATCH */}
          <div className="admin-chart">
            <h4>Batch Performance</h4>
            <BarChart width={350} height={250} data={batchData}>
              <XAxis dataKey="name" stroke="#ccc"/>
              <YAxis stroke="#ccc"/>
              <Tooltip />
              <Bar dataKey="avg" fill="#6366f1" />
            </BarChart>
          </div>

          {/* TECH */}
          <div className="admin-chart">
            <h4>Technology Performance</h4>
            <BarChart width={350} height={250} data={techData}>
              <XAxis dataKey="name" stroke="#ccc"/>
              <YAxis stroke="#ccc"/>
              <Tooltip />
              <Bar dataKey="avg" fill="#8b5cf6" />
            </BarChart>
          </div>

        </div>
      </div>

      {/* 🏆 LEADERBOARD */}
      <div className="admin-section">
        <h3>🏆 Top Performers</h3>

        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map((e,i)=>(
              <tr key={i}>
                <td>{i+1}</td>
                <td>{e.assignment?.participant?.name}</td>
                <td>{e.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminDashboard;