import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import jsPDF from "jspdf";
import "./Reports.css";
import html2canvas from "html2canvas";

const Reports = () => {

  const [limit, setLimit] = useState("ALL");
  const [mode, setMode] = useState("BEST"); // BEST | ALL
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔥 ADD THESE STATES AT TOP
  const [batch, setBatch] = useState("");
  const [tech, setTech] = useState("");
  const [round, setRound] = useState("");

  const [batches, setBatches] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [rounds, setRounds] = useState([]);

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const load = useCallback(() => {
    fetch("http://localhost:8080/evaluation", { headers })
      .then(res => res.json())
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => toast.error("Failed ❌"));
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("http://localhost:8080/batch", { headers })
      .then(res => res.json())
      .then(setBatches);

    fetch("http://localhost:8080/technology", { headers })
      .then(res => res.json())
      .then(setTechnologies);

    fetch("http://localhost:8080/round", { headers })
      .then(res => res.json())
      .then(setRounds);

  }, [headers]);

  // 🔍 FILTER
  const filtered = data.filter(e => {
    const nameMatch =
      e.assignment?.participant?.name?.toLowerCase()
        ?.includes(search.toLowerCase());

    const batchMatch = batch
      ? String(e.assignment?.participant?.batch?.id || "") === String(batch)
      : true;

    const techMatch = tech
      ? String(e.assignment?.technology?.id || "") === String(tech)
      : true;

    const roundMatch = round
      ? String(e.assignment?.round?.id || "") === String(round)
      : true;

      console.log("DATA SAMPLE:", data[0]);
    return nameMatch && batchMatch && techMatch && roundMatch;
  });

  // 🔥 UNIQUE STUDENTS (BEST SCORE)
    const uniqueMap = {};

    filtered.forEach(e => {
      const name = e.assignment?.participant?.name;

      if (!name) return;

      if (!uniqueMap[name] || uniqueMap[name].score < e.score) {
        uniqueMap[name] = e;
      }
    });

const uniqueStudents = Object.values(uniqueMap);

  // 📊 SUMMARY
  const scores = filtered.map(e => e.score || 0);
  const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : 0;

  
  // 🏆 UNIQUE RANKING
  const unique = {};
  filtered.forEach(e => {
    const name = e.assignment?.participant?.name;
    if (!unique[name] || unique[name].score < e.score) {
      unique[name] = e;
    }
  });

  const ranking = Object.values(unique).sort((a,b)=>b.score-a.score);
  const topStudent = ranking.length > 0 
  ? ranking[0].assignment?.participant?.name 
  : "-";

  // 📊 TECHNOLOGY ANALYSIS
  const techMap = {};
  filtered.forEach(e => {
    const tech = e.assignment?.technology?.name || "Unknown";
    if (!techMap[tech]) techMap[tech] = { total:0, count:0 };

    techMap[tech].total += e.score || 0;
    techMap[tech].count++;
  });

  const techData = Object.keys(techMap).map(t => ({
    name: t,
    avg: Number((techMap[t].total / techMap[t].count).toFixed(1))
  }));

  // 🥧 PERFORMANCE ZONES
  const pieData = [
    { name:"High", value: filtered.filter(e=>e.score>=7).length },
    { name:"Medium", value: filtered.filter(e=>e.score>=4 && e.score<7).length },
    { name:"Low", value: filtered.filter(e=>e.score<4).length }
  ];

  const COLORS = ["#22c55e","#facc15","#ef4444"];

  // 📈 FIXED TREND (GROUP BY DATE AVG)
  const trendMap = {};

  filtered.forEach(e => {
    const date = new Date(e.evaluationTime).toLocaleDateString();

    if (!trendMap[date]) {
      trendMap[date] = [];
    }

    trendMap[date].push(e.score || 0);
  });

  // const trendData = Object.keys(trendMap).map(date => {
  //   const arr = trendMap[date];
  //   const avg = arr.reduce((a,b)=>a+b,0) / arr.length;

  //   return {
  //     date,
  //     score: Number(avg.toFixed(1))
  //   };
  // });

  // ⚠️ INSIGHTS
  const weakSet = new Set();

  filtered.forEach(e => {
    if (e.score < 5) {
      const name = e.assignment?.participant?.name;
      if (name) weakSet.add(name);
    }
  });

const weak = weakSet.size;

  // const getLimitedRanking = () => {
  //   if (limit === "TOP5") return ranking.slice(0, 5);
  //   if (limit === "TOP10") return ranking.slice(0, 10);
  //   return ranking;
  // };

  // 🔁 ALL ATTEMPTS (no grouping)
  const allAttempts = [...filtered]
    .sort((a, b) => b.score - a.score);

  // 🏆 BEST (unique already exists as ranking)

  // 🔀 SELECT DATA BASED ON MODE
  const getBaseData = () => {
    return mode === "BEST" ? ranking : allAttempts;
  };

  // 🎯 APPLY LIMIT
  const getFinalData = () => {
    const base = getBaseData();

    if (limit === "TOP5") return base.slice(0, 5);
    if (limit === "TOP10") return base.slice(0, 10);

    return base;
  };

  const getStudentsByGroup = () => {
    if (!selectedGroup) return [];

    let list = [];

    if (selectedGroup === "Top") {
      list = filtered.filter(e => e.score >= 7);
    } else if (selectedGroup === "Average") {
      list = filtered.filter(e => e.score >= 4 && e.score < 7);
    } else if (selectedGroup === "Weak") {
      list = filtered.filter(e => e.score < 4);
    }

    // 🔥 unique students
    const map = {};
    list.forEach(e => {
      const name = e.assignment?.participant?.name;
      if (name && !map[name]) {
        map[name] = e;
      }
    });

    return Object.values(map);
  };

  const exportFullReportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const addBranding = () => {
      pdf.setFontSize(10);
      pdf.setTextColor(40);
      pdf.text("MockEval", margin, 10);

      pdf.setFontSize(7);
      pdf.setTextColor(120);
      pdf.text("Powered by NexTrain", margin, 14);

      pdf.setFontSize(7);
      pdf.text(`Generated: ${date}`, margin, pageHeight - 10);
      pdf.text(`Time: ${time}`, margin, pageHeight - 6);
    };

    // 🔥 GET CHART IMAGES
    const getChart = async (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const canvas = await html2canvas(el, { scale: 2 });
      return canvas.toDataURL("image/png");
    };

    const techChart = await getChart("chart-tech");
    const pieChart = await getChart("chart-pie");
    const perfChart = await getChart("chart-performance");
    const batchChart = await getChart("chart-batch");

    // =========================
    // 📄 PAGE 1 — SUMMARY + CHARTS
    // =========================
    addBranding();

    pdf.setFontSize(18);
    pdf.text("Evaluation Report", margin, 30);

    // Cards
    let y = 45;

    const drawCard = (label, value, x) => {
      pdf.setDrawColor(230);
      pdf.roundedRect(x, y, 60, 25, 4, 4);

      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(label, x + 5, y + 8);

      pdf.setFontSize(14);
      pdf.setTextColor(20);
      pdf.text(String(value), x + 5, y + 18);
    };

    drawCard("Average", avg, margin);
    drawCard("Total", filtered.length, margin + 65);
    drawCard("Weak", weak, margin + 130);

    y += 40;

    // 🔥 ADD CHARTS (GRID)
    if (techChart)
      pdf.addImage(techChart, "PNG", margin, y, 80, 60);

    if (pieChart)
      pdf.addImage(pieChart, "PNG", margin + 90, y, 80, 60);

    y += 70;

    if (perfChart)
      pdf.addImage(perfChart, "PNG", margin, y, 80, 60);

    if (batchChart)
      pdf.addImage(batchChart, "PNG", margin + 90, y, 80, 60);

    // =========================
    // 📄 PAGE 2 — LEADERBOARD
    // =========================
    pdf.addPage();
    addBranding();

    pdf.setFontSize(16);
    pdf.text("Leaderboard", margin, 30);

    // 🔥 ADD CONTEXT INFO
    pdf.setFontSize(10);
    pdf.setTextColor(120);

    // Mode (BEST / ALL)
    const modeText = mode === "BEST" ? "Best Scores" : "All Attempts";

    // Limit (TOP5 / TOP10 / ALL)
    let limitText = "All";
    if (limit === "TOP5") limitText = "Top 5";
    if (limit === "TOP10") limitText = "Top 10";

    pdf.text(`Mode: ${modeText}`, margin, 38);
    pdf.text(`Showing: ${limitText}`, margin + 80, 38);

    pdf.setTextColor(0);

    y = 50;

    pdf.setFontSize(10);
    pdf.text("Rank", margin, y);
    pdf.text("Candidate", margin + 30, y);
    pdf.text("Score", margin + 140, y);

    y += 5;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    getFinalData().slice(0, 20).forEach((e, i) => {
      pdf.text(String(i + 1), margin, y);
      pdf.text(e.assignment?.participant?.name || "-", margin + 30, y);
      pdf.text(String(e.score), margin + 140, y);

      y += 8;

      if (y > 270) {
        pdf.addPage();
        addBranding();
        y = 30;
      }
    });

    pdf.save("MockEval_Report.pdf");
  };

  return (
    <div id="report-content" className="report-container">

      <h2>📊 Analytics Dashboard</h2>

      <input
        className="search"
        placeholder="Search Candidate..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>

        <select value={batch} onChange={e => setBatch(e.target.value)}>
          <option value="">All Batches</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select value={tech} onChange={e => setTech(e.target.value)}>
          <option value="">All Technologies</option>
          {technologies.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select value={round} onChange={e => setRound(e.target.value)}>
          <option value="">All Rounds</option>
          {rounds.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

      </div>

      {/* SUMMARY */}
      <div className="cards" style={{ marginBottom: "20px", marginTop: "20px" }}>
        <div className="card"><h4>Average</h4><p>{avg}</p></div>
        <div className="card"><h4>Total</h4><p>{filtered.length}</p></div>
        <div className="card"><h4>Top</h4><p>{topStudent}</p></div>
        <div className="card"><h4>Weak</h4><p>{weak}</p></div>
      </div>

      {/* CHARTS */}
      <div className="charts">

        {/* BAR */}
        <div id="chart-tech" className="chart-box">
          <h4>Technology Performance</h4>
          <BarChart width={420} height={300} data={techData}>
            <XAxis dataKey="name" stroke="#ccc"/>
            <YAxis stroke="#ccc"/>
            <Tooltip />
            <Bar dataKey="avg" fill="#4f46e5" />
          </BarChart>
        </div>

        {/* PIE (FIXED SIZE) */}
        <div id="chart-pie" className="chart-box">
          <h4>🥧 Score Distribution</h4>

          <PieChart width={420} height={360}>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={120}   // balanced
              labelLine={true}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>

          <div className="legend">
            <div><span style={{background:"#22c55e"}}></span> High (7+)</div>
            <div><span style={{background:"#facc15"}}></span> Medium (4–6)</div>
            <div><span style={{background:"#ef4444"}}></span> Low (&lt;4)</div>
          </div>
        </div>

        {/* PERFORMANCE COMPARISON */}
        <div id="chart-performance" className="chart-box">
          <h4>📊 Performance Comparison</h4>

          <BarChart
            width={420}
            height={300}
            data={[
              { name: "Top", value: filtered.filter(e => e.score >= 7).length },
              { name: "Average", value: filtered.filter(e => e.score >= 4 && e.score < 7).length },
              { name: "Weak", value: filtered.filter(e => e.score < 4).length }
            ]}
            onClick={(data) => {
              if (!data || !data.activeLabel) return;
              setSelectedGroup(data.activeLabel);
              setShowModal(true);
            }}
          >
            <XAxis dataKey="name" stroke="#cbd5f5" />
            <YAxis stroke="#cbd5f5" />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" radius={[6,6,0,0]} />
          </BarChart>

          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
            Click bars to view students
          </p>
        </div>

        {/* 🔥 BATCH-WISE PERFORMANCE */}
      <div id="chart-batch" className="chart-box">
        <h4>📊 Batch Performance</h4>

        <BarChart width={420} height={300} data={
          Object.values(
            uniqueStudents.reduce((acc, e) => {
              const batch = e.assignment?.participant?.batch?.name || "Unknown";

              if (!acc[batch]) acc[batch] = { name: batch, total: 0, count: 0 };

              acc[batch].total += e.score || 0;
              acc[batch].count++;

              return acc;
            }, {})
          ).map(b => ({
            name: b.name,
            avg: Number((b.total / b.count).toFixed(1))
          }))
        }>
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Bar dataKey="avg" fill="#8b5cf6" radius={[6,6,0,0]} />
        </BarChart>

        <p style={{ fontSize: "12px", color: "#94a3b8" }}>
          Avg score per batch
        </p>
      </div>

      </div>

      {/* RANKING */}
      <div className="section">
      <h3>🏆 Leaderboard</h3>

      {/* 🔀 MODE TOGGLE */}
      <div className="toggle">
        <button
          className={mode === "BEST" ? "active" : ""}
          onClick={() => setMode("BEST")}
        >
          Best Scores
        </button>

        <button
          className={mode === "ALL" ? "active" : ""}
          onClick={() => setMode("ALL")}
        >
          All Attempts
        </button>
      </div>

      {/* 🎯 LIMIT FILTER */}
      <div className="toggle" style={{ marginTop: "8px" }}>
        <button
          className={limit === "TOP5" ? "active" : ""}
          onClick={() => setLimit("TOP5")}
        >
          Top 5
        </button>

        <button
          className={limit === "TOP10" ? "active" : ""}
          onClick={() => setLimit("TOP10")}
        >
          Top 10
        </button>

        <button
          className={limit === "ALL" ? "active" : ""}
          onClick={() => setLimit("ALL")}
        >
          All
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "#94a3b8" }}>
        Showing {getFinalData().length} results
      </p>

      <table className="leaderboard">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate</th>
            <th>Score</th>
            <th>Performance</th>
          </tr>
        </thead>

        <tbody>
          {getFinalData().map((e, i) => {
            const score = e.score;

            let badge = "Average";
            let color = "#facc15";

            if (score >= 8) {
              badge = "Excellent";
              color = "#22c55e";
            } else if (score < 5) {
              badge = "Poor";
              color = "#ef4444";
            }

            return (
              <tr key={i} className={i < 3 ? "top-rank" : ""}>
                <td>
                  {i === 0 && "🥇"}
                  {i === 1 && "🥈"}
                  {i === 2 && "🥉"}
                  {i > 2 && i + 1}
                </td>

                <td>{e.assignment?.participant?.name}</td>

                <td>
                  <span className="score-badge">{score}</span>
                </td>

                <td style={{ color }}>{badge}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* INSIGHTS */}
      <div className="insights">
        <h3>⚠️ Insights</h3>
        <p>Average score is {avg}</p>
        <p>{weak} unique students need improvement</p>
        <p>Top performer: {topStudent}</p>
      </div>

      <button onClick={exportFullReportPDF} className="btn-primary">
        📄 Export Full Report
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>{selectedGroup} Students</h3>

            <div className="modal-list">
              {getStudentsByGroup().map((e, i) => (
                <div key={i} className="modal-item">
                  <span>{e.assignment?.participant?.name}</span>
                  <span className="score-badge">{e.score}</span>
                </div>
              ))}
            </div>

            <button className="btn-close" onClick={() => setShowModal(false)}>
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;