import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "./Participants.css";

const Participants = () => {

  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [batchId, setBatchId] = useState("");
  const [technologyId, setTechnologyId] = useState("");

  const [batches, setBatches] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }), [token]);

  // 🔥 SAFE RESPONSE HANDLER
  const handleResponse = async (res) => {
    if (!res.ok) throw new Error();
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  };

  // 🔥 FETCH PARTICIPANTS
  const fetchParticipants = useCallback(() => {
    fetch("http://localhost:8080/participants", { headers })
      .then(handleResponse)
      .then(data => setParticipants(data || []))
      .catch(() => toast.error("Failed to load ❌"));
  }, [headers]);

  useEffect(() => {
    fetchParticipants();

    fetch("http://localhost:8080/batch", { headers })
      .then(handleResponse)
      .then(data => setBatches(data || []));

    fetch("http://localhost:8080/technology", { headers })
      .then(handleResponse)
      .then(data => setTechnologies(data || []));

  }, [fetchParticipants, headers]);

  // 🔥 ADD
  const addParticipant = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !batchId || !technologyId) {
      toast.error("All fields required ❌");
      return;
    }

    fetch("http://localhost:8080/participants", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        email,
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

      toast.success("Participant added 🚀");
      fetchParticipants();
      setName("");
      setEmail("");
      setBatchId("");
      setTechnologyId("");
    })
    .catch((err) => toast.error(err.message));
  };

  // 🔥 EDIT OPEN
  const openEdit = (p) => {
    setEditData(p);
    setShowModal(true);
  };

  // 🔥 UPDATE
  const updateParticipant = (e) => {
    e.preventDefault();

    if (!editData.name || !editData.email) {
      toast.error("Required fields missing ❌");
      return;
    }

    fetch(`http://localhost:8080/participants/${editData.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        ...editData,
        batch: { id: Number(editData.batchId) },
        technology: { id: Number(editData.technologyId) }
      })
    })
      .then(async (res) => {
      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data?.message || "Update failed ❌");
      }

      toast.success("Updated successfully ✅");
      setShowModal(false);
      fetchParticipants();
    })
    .catch((err) => toast.error(err.message));
  };

  // 🔥 DEACTIVATE
  const confirmDeactivate = () => {
    fetch(`http://localhost:8080/participants/deactivate/${selectedId}`, {
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
      setConfirmOpen(false);
      fetchParticipants();
    })
    .catch((err) => toast.error(err.message));
  };

  // 🔍 SEARCH
  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">

      <h2>Participants Management</h2>

      {/* ADD FORM */}
      <form onSubmit={addParticipant} className="user-form">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

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

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Batch</th>
            <th>Tech</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((p, index) => (
            <tr key={p.id}>
              <td>{index + 1}</td>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.batch?.name || "-"}</td>
              <td>{p.technology?.name || "-"}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => openEdit(p)}>Edit</button>
                <button className="delete-btn" onClick={() => {
                  setSelectedId(p.id);
                  setConfirmOpen(true);
                }}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Participant</h3>

            <form onSubmit={updateParticipant}>
              <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              <input value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />

              <select value={editData.batch?.id} onChange={e => setEditData({...editData, batchId: e.target.value})}>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <select value={editData.technology?.id} onChange={e => setEditData({...editData, technologyId: e.target.value})}>
                {technologies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <button type="submit">Update</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Deactivate Participant?</h3>
            <button onClick={confirmDeactivate}>Yes</button>
            <button onClick={() => setConfirmOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Participants;