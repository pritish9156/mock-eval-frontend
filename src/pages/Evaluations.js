import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import "./Users.css";
import "./Evaluations.css";

const Evaluations = () => {

  const [evaluations, setEvaluations] = useState([]);

  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const [expandedRow, setExpandedRow] = useState(null);

  // 🔥 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  useEffect(() => {
    fetch("http://localhost:8080/evaluation", { headers })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setEvaluations(data || []))
      .catch(() => toast.error("Failed to load evaluations ❌"));
  }, [headers]);

  // 🔥 FILTER + SORT
  const filteredData = evaluations
    .filter(e =>
      (e.assignment?.participant?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.assignment?.evaluator?.name || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter(e =>
      scoreFilter ? e.score >= Number(scoreFilter) : true
    )
    .filter(e =>
      techFilter ? e.assignment?.technology?.name === techFilter : true
    )
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return new Date(b.evaluationTime) - new Date(a.evaluationTime);
      }
      return new Date(a.evaluationTime) - new Date(b.evaluationTime);
    });

  // 🔥 PAGINATION LOGIC
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // 🔥 UNIQUE TECH
  const techOptions = [
    ...new Set(
      evaluations.map(e => e.assignment?.technology?.name).filter(Boolean)
    )
  ];

  // 📄 SINGLE PDF
  const downloadPDF = (e) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    // 🔷 HEADER
    doc.setFillColor(30, 41, 59); // dark header
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
    doc.rect(15, y, pageWidth - 30, 35);

    doc.setFontSize(12);

    doc.text(`Candidate: ${e.assignment?.participant?.name}`, 20, y + 10);
    doc.text(`Evaluator: ${e.assignment?.evaluator?.name}`, 20, y + 20);

    doc.text(`Technology: ${e.assignment?.technology?.name}`, pageWidth / 2, y + 10);
    doc.text(`Score: ${e.score}/10`, pageWidth / 2, y + 20);

    y += 50;

    // 🔷 FEEDBACK SECTION
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("Feedback", 20, y);

    y += 8;

    doc.setDrawColor(220);
    doc.rect(15, y, pageWidth - 30, 30);

    const feedbackLines = doc.splitTextToSize(e.feedback || "-", pageWidth - 40);
    doc.setFontSize(11);
    doc.text(feedbackLines, 20, y + 10);

    y += 40;

    // 🔷 FUNCTION TO ADD LIST SECTION
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
      `Generated on ${new Date().toLocaleString()}`,
      20,
      doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`${e.assignment?.participant?.name}_Report.pdf`);
  };

 const exportAllPDF = () => {
    const doc = new jsPDF();

    filteredData.forEach((e, index) => {

      if (index !== 0) doc.addPage(); // 🔥 new page per student

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

      // 🔷 CANDIDATE BOX
      doc.setDrawColor(200);
      doc.rect(15, y, pageWidth - 30, 35);

      doc.setFontSize(12);

      doc.text(`Candidate: ${e.assignment?.participant?.name}`, 20, y + 10);
      doc.text(`Evaluator: ${e.assignment?.evaluator?.name}`, 20, y + 20);

      doc.text(`Technology: ${e.assignment?.technology?.name}`, pageWidth / 2, y + 10);
      doc.text(`Score: ${e.score}/10`, pageWidth / 2, y + 20);

      y += 50;

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

      // 🔷 SECTION FUNCTION
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
        `Generated on ${new Date().toLocaleString()}`,
        20,
        doc.internal.pageSize.getHeight() - 10
      );

    });

    doc.save("All_Evaluation_Reports.pdf");
  };

  // 📊 EXPORT EXCEL
  const exportExcel = () => {
    const data = filteredData.map(e => ({
      Candidate: e.assignment?.participant?.name,
      Evaluator: e.assignment?.evaluator?.name,
      Technology: e.assignment?.technology?.name,
      Round: e.assignment?.round?.name,
      Score: e.score,
      Feedback: e.feedback,
      Date: e.evaluationTime
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluations");

    XLSX.writeFile(workbook, "Evaluations.xlsx");
  };

  return (
    <div className="users-container">

      <h2>Evaluation Reports</h2>

      {/* 🔥 FILTER BAR */}
      <div className="admin-filters">

        <input
          placeholder="Search Candidate / Evaluator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setScoreFilter(e.target.value)}>
          <option value="">All Scores</option>
          <option value="5">5+</option>
          <option value="7">7+</option>
          <option value="9">9+</option>
        </select>

        <select onChange={(e) => setTechFilter(e.target.value)}>
          <option value="">All Technologies</option>
          {techOptions.map((t, i) => (
            <option key={i}>{t}</option>
          ))}
        </select>

        <select onChange={(e) => setSortOrder(e.target.value)}>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

      </div>

      {/* 🔥 ACTION BUTTONS */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <button onClick={exportAllPDF}>📤 Export PDF</button>
        <button onClick={exportExcel}>📊 Export Excel</button>
      </div>

      {paginatedData.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No evaluations found 🚫
        </p>
      ) : (

        <div className="admin-table-wrapper">

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Participant</th>
                <th>Evaluator</th>
                <th>Technology</th>
                <th>Score</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((e, i) => (
                <tr key={e.id}>
                  <td>{i + 1}</td>

                  <td>{e.assignment?.participant?.name}</td>
                  <td>{e.assignment?.evaluator?.name}</td>
                  <td>{e.assignment?.technology?.name}</td>

                  <td>{e.score}</td>

                  <td
                    onClick={() => setExpandedRow(expandedRow === e.id ? null : e.id)}
                    style={{ cursor: "pointer", maxWidth: "200px" }}
                  >
                    {expandedRow === e.id
                      ? e.feedback
                      : (e.feedback?.slice(0, 30) || "") + "..."}
                  </td>

                  <td>
                    {e.evaluationTime
                      ? new Date(e.evaluationTime).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    <button onClick={() => downloadPDF(e)}>
                      📄 PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

      {/* 🔥 PAGINATION */}
      <div className="pagination">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={currentPage === i + 1 ? "active" : ""}
        >
          {i + 1}
        </button>
      ))}
    </div>

    </div>
  );
};

export default Evaluations;