import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "./Users.css";
import "./EvaluatorDashboard.css";

const EvaluatorDashboard = () => {

  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);

  const [score, setScore] = useState(5);
  const [feedback, setFeedback] = useState("");

  const [editableAI, setEditableAI] = useState(null);

  const [activeTab, setActiveTab] = useState("feedback");

  const [finalEvaluation, setFinalEvaluation] = useState({
    strengths: [],
    weaknesses: [],
    plan: []
  });

  const [manualEval, setManualEval] = useState({
    strengths: [""],
    weaknesses: [""],
    plan: [""]
  });

  const [aiApplied, setAiApplied] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }), [token]);

  useEffect(() => {
    fetch(`http://localhost:8080/assignment/evaluator/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setAssignments(data || []))
      .catch(() => toast.error("Failed to load ❌"));
  }, [headers, userId]);

  // FINAL DATA
  const getFinalData = () => {
    if (aiApplied) {
      return {
        strengths: finalEvaluation.strengths,
        weaknesses: finalEvaluation.weaknesses,
        plan: finalEvaluation.plan
      };
    }

    return {
      strengths: manualEval.strengths.filter(s => s.trim()),
      weaknesses: manualEval.weaknesses.filter(w => w.trim()),
      plan: manualEval.plan.filter(p => p.trim())
    };
  };

  // AI CALL
  const runAI = async () => {
    if (!feedback.trim()) {
      toast.error("Write feedback first ❌");
      return;
    }

    setLoadingAI(true);

    try {
      const res = await fetch("http://localhost:8080/ai/improve", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: feedback })
      });

      const data = await res.json();

      setEditableAI(data);
      setActiveTab("ai");

    } catch {
      toast.error("AI failed ❌");
    } finally {
      setLoadingAI(false);
    }
  };

  // APPLY AI
  const applyAI = () => {
    setFeedback(editableAI.improvedText);
    setScore(editableAI.score);

    setFinalEvaluation({
      strengths: editableAI.strengths || [],
      weaknesses: editableAI.weaknesses || [],
      plan: editableAI.plan || []
    });

    setAiApplied(true);
    setActiveTab("final");
  };

  const downloadPDFForRow = (a) => {
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
    doc.rect(15, y, pageWidth - 30, 35);

    doc.setFontSize(12);

    doc.text(`Candidate: ${a.participant?.name}`, 20, y + 10);
    doc.text(`Technology: ${a.technology?.name}`, 20, y + 20);

    doc.text(`Round: ${a.round?.name}`, pageWidth / 2, y + 10);
    doc.text(`Score: ${a.score || "-"}/10`, pageWidth / 2, y + 20);

    y += 50;

    // 🔷 FEEDBACK SECTION
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("Feedback", 20, y);

    y += 8;

    doc.setDrawColor(220);
    doc.rect(15, y, pageWidth - 30, 30);

    const feedbackLines = doc.splitTextToSize(a.feedback || "-", pageWidth - 40);
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
    addSection("Strengths", a.strengths);
    addSection("Weaknesses", a.weaknesses);
    addSection("Improvement Plan", a.plan);

    // 🔷 FOOTER
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      20,
      doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`${a.participant?.name}_Evaluation.pdf`);
  };

  const submitEvaluation = (e) => {
    e.preventDefault();

    const finalData = getFinalData();

    fetch("http://localhost:8080/evaluation", {
      method: "POST",
      headers,
      body: JSON.stringify({
        score,
        feedback,
        ...finalData,
        assignment: { id: selected.id }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed ❌");

        toast.success("Evaluation submitted 🚀");

        setAssignments(prev =>
          prev.filter(a => a.id !== selected.id)
        );

        setSelected(null);
        setEditableAI(null);
        setAiApplied(false);
        setFinalEvaluation({ strengths: [], weaknesses: [], plan: [] });
        setManualEval({ strengths: [""], weaknesses: [""], plan: [""] });

      })
      .catch(err => toast.error(err.message));
  };

  return (
    <div className="users-container">

      <h2>Evaluator Dashboard</h2>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Participant</th>
            <th>Round</th>
            <th>Technology</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {assignments.map((a, i) => (
            <tr key={a.id}>
              <td>{i + 1}</td>
              <td>{a.participant?.name}</td>
              <td>{a.round?.name}</td>
              <td>{a.technology?.name}</td>
              <td>
                {a.score !== undefined && a.score !== null ? (
                  <button onClick={() => downloadPDFForRow(a)}>
                    📄 Download
                  </button>
                ) : (
                  <button onClick={() => setSelected(a)}>
                    Evaluate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Evaluate Participant</h2>

            <div className="score-box">
              <label>Score: {score}</label>
              <input type="range" min="0" max="10" value={score}
                onChange={(e) => setScore(Number(e.target.value))}/>
            </div>

            <div className="tabs">
              <button className={activeTab==="feedback"?"active":""} onClick={()=>setActiveTab("feedback")}>📝 Feedback</button>
              <button className={activeTab==="ai"?"active":""} onClick={()=>setActiveTab("ai")}>✨ AI</button>
              <button className={activeTab==="final"?"active":""} onClick={()=>setActiveTab("final")}>📊 Final</button>
            </div>

            {/* FEEDBACK */}
            {activeTab==="feedback" && (
              <div className="card">
                <textarea value={feedback} onChange={(e)=>setFeedback(e.target.value)} />
                <button className="btn-ai" onClick={runAI}>
                  {loadingAI ? "Generating..." : "✨ Generate AI"}
                </button>
              </div>
            )}

            {/* AI */}
            {activeTab==="ai" && (
              <div className="card">

                {!editableAI ? (
                  <p>⚠️ AI not generated yet. Please generate from feedback tab.</p>
                ) : (
                  <>
                    <p><b>AI Suggested Score:</b> {editableAI.score}</p>

                    <textarea
                      value={editableAI.improvedText}
                      onChange={(e)=>setEditableAI({...editableAI, improvedText:e.target.value})}
                    />

                    <h5>Strengths</h5>
                    {editableAI.strengths.map((s,i)=>(
                      <input key={i} value={s}
                        onChange={(e)=>{
                          const arr=[...editableAI.strengths];
                          arr[i]=e.target.value;
                          setEditableAI({...editableAI,strengths:arr});
                        }}
                      />
                    ))}

                    <h5>Weaknesses</h5>
                    {editableAI.weaknesses.map((w,i)=>(
                      <input key={i} value={w}
                        onChange={(e)=>{
                          const arr=[...editableAI.weaknesses];
                          arr[i]=e.target.value;
                          setEditableAI({...editableAI,weaknesses:arr});
                        }}
                      />
                    ))}

                    <h5>Plan</h5>
                    {editableAI.plan.map((p,i)=>(
                      <input key={i} value={p}
                        onChange={(e)=>{
                          const arr=[...editableAI.plan];
                          arr[i]=e.target.value;
                          setEditableAI({...editableAI,plan:arr});
                        }}
                      />
                    ))}

                    <button className="btn-primary" onClick={applyAI}>
                      Apply AI Result
                    </button>
                  </>
                )}
              </div>
            )}

            {/* FINAL */}
            {activeTab==="final" && (
              <div className="card">

                {aiApplied && (
                  <button className="btn-secondary"
                    onClick={()=>{
                      setFinalEvaluation({ strengths: [], weaknesses: [], plan: [] });
                      setAiApplied(false);
                    }}>
                    Reset to Manual
                  </button>
                )}

                <h5>Strengths</h5>

                {(aiApplied ? finalEvaluation.strengths : manualEval.strengths).map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                    
                    <span style={{ width: "20px" }}>{i + 1}.</span>

                    <input
                      style={{ flex: 1 }}
                      value={s}
                      onChange={(e) => {
                        const newArr = [...arr];
                        newArr[i] = e.target.value;

                        aiApplied
                          ? setFinalEvaluation({ ...finalEvaluation, strengths: newArr })
                          : setManualEval({ ...manualEval, strengths: newArr });
                      }}
                    />
                    

                    {/* ❌ */}
                    <button
                      style={{
                        width: "32px",
                        height: "32px",
                        minWidth: "32px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#1e293b",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        let newArr = arr.filter((_, index) => index !== i);
                        if (newArr.length === 0) newArr.push("");

                        aiApplied
                          ? setFinalEvaluation({ ...finalEvaluation, strengths: newArr })
                          : setManualEval({ ...manualEval, strengths: newArr });
                      }}
                    >
                      ✖
                    </button>

                  </div>
                ))}

                <button
                  className="btn-secondary"
                  onClick={() => {
                    aiApplied
                      ? setFinalEvaluation({
                          ...finalEvaluation,
                          strengths: [...finalEvaluation.strengths, ""]
                        })
                      : setManualEval({
                          ...manualEval,
                          strengths: [...manualEval.strengths, ""]
                        });
                  }}
                >
                  ➕ Add Strength
                </button>

                <h5>Weaknesses</h5>
                {(aiApplied ? finalEvaluation.weaknesses : manualEval.weaknesses).map((w, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ width: "20px" }}>{i + 1}.</span>

                    <input
                      style={{ flex: 1 }}
                      value={w}
                      onChange={(e) => {
                        const newArr = [...arr];
                        newArr[i] = e.target.value;

                        aiApplied
                          ? setFinalEvaluation({ ...finalEvaluation, weaknesses: newArr })
                          : setManualEval({ ...manualEval, weaknesses: newArr });
                      }}
                    />

                    <button
                      style={{
                        width: "32px",
                        height: "32px",
                        minWidth: "32px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#1e293b",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        let newArr = arr.filter((_, index) => index !== i);
                        if (newArr.length === 0) newArr.push("");

                        aiApplied
                          ? setFinalEvaluation({ ...finalEvaluation, weaknesses: newArr })
                          : setManualEval({ ...manualEval, weaknesses: newArr });
                      }}
                    >
                      ✖
                    </button>
                  </div>
                ))}

                <button className="btn-secondary" onClick={() => {
                  aiApplied
                    ? setFinalEvaluation({ ...finalEvaluation, weaknesses: [...finalEvaluation.weaknesses, ""] })
                    : setManualEval({ ...manualEval, weaknesses: [...manualEval.weaknesses, ""] });
                }}>
                  ➕ Add Weakness
                </button>

                <h5>Plan</h5>

                {(aiApplied ? finalEvaluation.plan : manualEval.plan).map((p, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                    
                    {/* 🔢 Number */}
                    <span style={{ width: "20px" }}>{i + 1}.</span>

                    {/* ✏️ Input */}
                    <input
                      style={{ flex: 1 }}
                      value={p}
                      onChange={(e) => {
                        const newArr = [...arr];
                        newArr[i] = e.target.value;

                        aiApplied
                          ? setFinalEvaluation({ ...finalEvaluation, plan: newArr })
                          : setManualEval({ ...manualEval, plan: newArr });
                      }}
                    />            

                    {/* ❌ Remove */}
                    <button
                        style={{
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#1e293b",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          let newArr = arr.filter((_, index) => index !== i);
                          if (newArr.length === 0) newArr.push("");

                          aiApplied
                            ? setFinalEvaluation({ ...finalEvaluation, plan: newArr })
                            : setManualEval({ ...manualEval, plan: newArr });
                        }}
                      >
                        ✖
                      </button>

                  </div>
                ))}

                {/* ➕ Add New Plan */}
                <button
                  className="btn-secondary"
                  onClick={() => {
                    aiApplied
                      ? setFinalEvaluation({
                          ...finalEvaluation,
                          plan: [...finalEvaluation.plan, ""]
                        })
                      : setManualEval({
                          ...manualEval,
                          plan: [...manualEval.plan, ""]
                        });
                  }}
                >
                  ➕ Add Plan
                </button>

              </div>
            )}

            <div className="actions">
              <button className="btn-secondary" onClick={()=>setSelected(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitEvaluation}>Submit</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EvaluatorDashboard;