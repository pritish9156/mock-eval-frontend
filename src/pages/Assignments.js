import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "./Users.css";
import "./Assignment.css";

const Assignment = () => {

  const [assignments, setAssignments] = useState([]);

  const [participantId, setParticipantId] = useState("");
  const [evaluatorId, setEvaluatorId] = useState("");
  const [roundId, setRoundId] = useState("");
  const [technologyId, setTechnologyId] = useState("");

  const [participants, setParticipants] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [editData, setEditData] = useState(null);
  const [technologies, setTechnologies] = useState([]);

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }), [token]);

  // 🔥 FETCH ASSIGNMENTS
  const fetchAssignments = useCallback(() => {
    fetch("http://localhost:8080/assignment", { headers })
      .then(res => res.json())
      .then(data => setAssignments(data || []))
      .catch(() => toast.error("Failed to load ❌"));
  }, [headers]);

  useEffect(() => {
    fetchAssignments();

    fetch("http://localhost:8080/participants", { headers })
      .then(res => res.json())
      .then(setParticipants);

    fetch("http://localhost:8080/users", { headers })
      .then(res => res.json())
      .then(data => {
        // only evaluators
        setEvaluators(data.filter(u => u.role === "EVALUATOR"));
      });

    fetch("http://localhost:8080/round", { headers })
      .then(res => res.json())
      .then(setRounds);

    fetch("http://localhost:8080/technology", { headers })
      .then(res => res.json())
      .then(setTechnologies);

  }, [fetchAssignments, headers]);

  // 🔥 ADD ASSIGNMENT
  const addAssignment = (e) => {
    e.preventDefault();

    if (!participantId || !evaluatorId || !roundId || !technologyId) {
      toast.error("All fields required ❌");
      return;
    }

    fetch("http://localhost:8080/assignment", {
      method: "POST",
      headers,
      body: JSON.stringify({
        participant: { id: Number(participantId) },
        evaluator: { id: Number(evaluatorId) },
        round: { id: Number(roundId) },
        technology: { id: Number(technologyId) }
      })
    })
      .then(async (res) => {
        let data = null;
        try { data = await res.json(); } catch {}

        if (!res.ok) {
          throw new Error(data?.message || "Failed ❌");
        }

        toast.success("Assigned successfully 🚀");
        fetchAssignments();

        setParticipantId("");
        setEvaluatorId("");
        setRoundId("");
        setTechnologyId("");

      })
      .catch((err) => toast.error(err.message));
  };

  const openEdit = (a) => {
    setEditData({
      ...a,
      participantId: a.participant?.id,
      evaluatorId: a.evaluator?.id,
      roundId: a.round?.id,
      technologyId: a.technology?.id
    });
  };

  const updateAssignment = (e) => {
  e.preventDefault();

    fetch(`http://localhost:8080/assignment/${editData.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        participant: { id: Number(editData.participantId) },
        evaluator: { id: Number(editData.evaluatorId) },
        round: { id: Number(editData.roundId) },
        technology: { id: Number(editData.technologyId) }
      })
    })
      .then(async (res) => {
        let data = null;
        try { data = await res.json(); } catch {}

        if (!res.ok) {
          throw new Error(data?.message || "Failed ❌");
        }

        toast.success("Updated ✅");
        setEditData(null);
        fetchAssignments();
      })
      .catch((err) => toast.error(err.message));
  };

  // 🔥 DEACTIVATE
  const deactivate = (id) => {
    fetch(`http://localhost:8080/assignment/deactivate/${id}`, {
      method: "PUT",
      headers
    })
      .then(async (res) => {
        let data = null;
        try { data = await res.json(); } catch {}

        if (!res.ok) {
          throw new Error(data?.message || "Failed ❌");
        }

        toast.success("Deactivated ⚡");
        fetchAssignments();
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="users-container">

      <h2>Assignment Management</h2>

      {/* FORM */}
      <form onSubmit={addAssignment} className="user-form">

        <select value={participantId} onChange={e => setParticipantId(e.target.value)} className="user-form-select">
          <option value="">Select Participant</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select value={evaluatorId} onChange={e => setEvaluatorId(e.target.value)} className="user-form-select">
          <option value="">Select Evaluator</option>
          {evaluators.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <select value={roundId} onChange={e => setRoundId(e.target.value)} className="user-form-select">
          <option value="">Select Round</option>
          {rounds.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select value={technologyId} onChange={e => setTechnologyId(e.target.value)} className="user-form-select">
          <option value="">Select Technology</option>
          {technologies.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <button className="user-form-btn">Add Assignment</button>
      </form>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Participant</th>
            <th>Evaluator</th>
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
              <td>{a.evaluator?.name}</td>
              <td>{a.round?.name}</td>
              <td>{a.technology?.name}</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => openEdit(a)}>Edit</button>
                  <button className="delete-btn" onClick={() => deactivate(a.id)}>
                    Deactivate
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

      {editData && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Edit Assignment</h3>

            <form onSubmit={updateAssignment}>

              <select value={editData.participantId}
                onChange={e => setEditData({...editData, participantId: e.target.value})}>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select value={editData.evaluatorId}
                onChange={e => setEditData({...editData, evaluatorId: e.target.value})}>
                {evaluators.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>

              <select value={editData.roundId}
                onChange={e => setEditData({...editData, roundId: e.target.value})}>
                {rounds.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <select value={editData.technologyId}
                onChange={e => setEditData({...editData, technologyId: e.target.value})}>
                {technologies.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div className="modal-actions">
                <button className="update-btn">Update</button>
                <button type="button" className="cancel-btn" onClick={() => setEditData(null)}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;