import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "./EvaluatorHistory.css";
import "./Users.css";

const EvaluatorHistory = () => {

  const [evaluations, setEvaluations] = useState([]);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`http://localhost:8080/evaluation/evaluator/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEvaluations(data || []));
  }, [userId, token]);

  // 🔍 FILTER + SORT
  const filteredData = evaluations
    .filter(e =>
      e.assignment?.participant?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(e =>
      scoreFilter ? e.score >= Number(scoreFilter) : true
    )
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return new Date(b.evaluationTime) - new Date(a.evaluationTime);
      }
      return new Date(a.evaluationTime) - new Date(b.evaluationTime);
    });

  // 📄 PDF
  const downloadPDF = (e) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 🔷 HEADER
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("MockEval Report", 20, 18);

    doc.setFontSize(10);
    doc.text("Powered by NexTrain", pageWidth - 60, 18);

    let y = 40;
    doc.setTextColor(0, 0, 0);

    // 🔷 CANDIDATE INFO BOX
    doc.setDrawColor(200);
    doc.rect(15, y, pageWidth - 30, 40);

    doc.setFontSize(12);

    doc.text(`Candidate: ${e.assignment?.participant?.name}`, 20, y + 10);
    doc.text(`Evaluator: ${e.assignment?.evaluator?.name}`, 20, y + 20);

    doc.text(`Technology: ${e.assignment?.technology?.name}`, pageWidth / 2, y + 10);
    doc.text(`Round: ${e.assignment?.round?.name}`, pageWidth / 2, y + 20);

    doc.text(`Score: ${e.score}/10`, 20, y + 30);

    y += 55;

    // 🔷 FEEDBACK
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("Feedback", 20, y);

    y += 8;

    doc.setDrawColor(220);
    doc.rect(15, y, pageWidth - 30, 30);

    const feedbackLines = doc.splitTextToSize(e.feedback || "-", pageWidth - 40);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(feedbackLines, 20, y + 10);

    y += 40;

    // 🔷 COMMON SECTION FUNCTION
    const addSection = (title, list) => {
        if (!list || list.length === 0) return;

        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text(title, 20, y);

        y += 8;

        doc.setDrawColor(220);
        doc.rect(15, y, pageWidth - 30, 10 + list.length * 8);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        list.forEach((item, i) => {
        doc.text(`• ${item}`, 20, y + 8 + i * 8);
        });

        y += 15 + list.length * 8;
    };

    // 🔷 SECTIONS
    addSection("Strengths", e.strengths);
    addSection("Weaknesses", e.weaknesses);
    addSection("Improvement Plan", e.plan);

    // 🔷 FOOTER
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
        `Generated on ${new Date(e.evaluationTime).toLocaleString()}`,
        20,
        doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`${e.assignment?.participant?.name}_History_Report.pdf`);
    };

  return (
    <div className="users-container">

      <h2>My Evaluation History</h2>

      {/* 🔥 FILTER BAR */}
      <div className="history-filters">

        <input
          placeholder="Search Candidate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setScoreFilter(e.target.value)}>
          <option value="">All Scores</option>
          <option value="5">5+</option>
          <option value="7">7+</option>
          <option value="9">9+</option>
        </select>

        <select onChange={(e) => setSortOrder(e.target.value)}>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

      </div>

      {/* 🔥 SCROLL FIX */}
      <div className="history-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Candidate</th>
              <th>Technology</th>
              <th>Round</th>
              <th>Score</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((e, i) => (
              <tr key={e.id}>
                <td>{i + 1}</td>
                <td>{e.assignment?.participant?.name}</td>
                <td>{e.assignment?.technology?.name}</td>
                <td>{e.assignment?.round?.name}</td>
                <td>{e.score}</td>
                <td>
                  {new Date(e.evaluationTime).toLocaleDateString()}
                </td>
                <td>
                  <button onClick={() => downloadPDF(e)}>
                    📄 Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default EvaluatorHistory;