import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "./Users.css"; // 🔥 reuse same css

const Rounds = () => {

  const [rounds, setRounds] = useState([]);
  const [name, setName] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [batchId, setBatchId] = useState("");
  const [technologyId, setTechnologyId] = useState("");

  const [batches, setBatches] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  const [editData, setEditData] = useState(null);

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }), [token]);

  const handleResponse = async (res) => {
    if (!res.ok) throw new Error();
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  };

  const fetchRounds = useCallback(() => {
    fetch("http://localhost:8080/round", { headers })
      .then(handleResponse)
      .then(data => setRounds(data || []))
      .catch(() => toast.error("Failed to load ❌"));
  }, [headers]);

  useEffect(() => {
    fetchRounds();

    fetch("http://localhost:8080/batch", { headers })
      .then(handleResponse)
      .then(data => setBatches(data || []));

    fetch("http://localhost:8080/technology", { headers })
      .then(handleResponse)
      .then(data => setTechnologies(data || []));

  }, [fetchRounds, headers]);

  // ADD
  const addRound = (e) => {
    e.preventDefault();

     console.log({
    name,
    roundNumber,
    batchId,
    technologyId
    });
    
    if (!name || !roundNumber || !batchId || !technologyId) {
      toast.error("All fields required ❌");
      return;
    }

    fetch("http://localhost:8080/round", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        roundNumber: Number(roundNumber),
        batch: { id: Number(batchId) },
        technology: { id: Number(technologyId) }
      })
    })
      .then(async (res) => {
      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data?.message || "Failed ❌");
      }

      toast.success("Round created 🚀");
      fetchRounds();
      setName("");
      setRoundNumber("");
      setBatchId("");
      setTechnologyId("");
    })
    .catch((err) => toast.error(err.message));
  };

  // EDIT
  const openEdit = (r) => {
    setEditData({
      ...r,
      batchId: r.batch?.id,
      technologyId: r.technology?.id
    });
  };

  const updateRound = (e) => {
    e.preventDefault();

    fetch(`http://localhost:8080/round/${editData.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: editData.name,
        roundNumber: Number(editData.roundNumber),
        batch: { id: Number(editData.batchId) },
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
      fetchRounds();
    })
    .catch((err) => toast.error(err.message));
  };

  // DEACTIVATE
  const deactivate = (id) => {
    fetch(`http://localhost:8080/round/deactivate/${id}`, {
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
      fetchRounds();
    })
    .catch((err) => toast.error(err.message));
  };

  return (
    <div className="users-container">
      <h2>Rounds Management</h2>

      {/* FORM */}
      <form onSubmit={addRound} className="user-form">
        <input placeholder="Round Name" value={name} onChange={e => setName(e.target.value)} />

        <input type="number" placeholder="Round Number"
          value={roundNumber}
          onChange={e => setRoundNumber(e.target.value)}
        />

        <select value={batchId} onChange={e => setBatchId(e.target.value)}>
          <option value="">Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select value={technologyId} onChange={e => setTechnologyId(e.target.value)}>
          <option value="">Technology</option>
          {technologies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <button>Add</button>
      </form>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Round No</th>
            <th>Batch</th>
            <th>Tech</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rounds.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.roundNumber}</td>
              <td>{r.batch?.name || "N/A"}</td>
              <td>{r.technology?.name || "N/A"}</td>

              <td>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => openEdit(r)}>Edit</button>
                  <button className="delete-btn" onClick={() => deactivate(r.id)}>Deactivate</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {editData && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Edit Round</h3>

            <form onSubmit={updateRound}>

              <div className="input-group">
                <label>Name</label>
                <input value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Round Number</label>
                <input type="number" value={editData.roundNumber}
                  onChange={e => setEditData({...editData, roundNumber: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Batch</label>
                <select value={editData.batchId}
                  onChange={e => setEditData({...editData, batchId: e.target.value})}>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>Technology</label>
                <select value={editData.technologyId}
                  onChange={e => setEditData({...editData, technologyId: e.target.value})}>
                  {technologies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

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

export default Rounds;