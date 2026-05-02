import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "./Users.css";

const Batch = () => {

  const [batches, setBatches] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const fetchBatch = useCallback(() => {
    fetch("http://localhost:8080/batch", { headers })
      .then(handleResponse)
      .then(data => setBatches(data || []))
      .catch((err) => toast.error(err.message || "Failed to load ❌"));
  }, [headers]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  // ADD
  const addBatch = (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      toast.error("All fields required ❌");
      return;
    }

    fetch("http://localhost:8080/batch", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, startDate, endDate })
    })
      .then(async (res) => {
      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data?.message || "Failed ❌");
      }

      toast.success("Batch created 🚀");
      fetchBatch();
      setName("");
      setStartDate("");
      setEndDate("");
    })
    .catch((err) => toast.error(err.message));
  };

  // EDIT OPEN
  const openEdit = (b) => {
    setEditData({ ...b });
  };

  // UPDATE
  const updateBatch = (e) => {
    e.preventDefault();

    fetch(`http://localhost:8080/batch/${editData.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(editData)
    })
      .then(async (res) => {
      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data?.message || "Failed ❌");
      }

      toast.success("Updated ✅");
      setEditData(null);
      fetchBatch();
    })
    .catch((err) => toast.error(err.message));
  };

  // DEACTIVATE
  const deactivate = (id) => {
    fetch(`http://localhost:8080/batch/deactivate/${id}`, {
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
      fetchBatch();
    })
    .catch((err) => toast.error(err.message));
  };

  return (
    <div className="users-container">
      <h2>Batch Management</h2>

      <form onSubmit={addBatch} className="user-form">
        <input placeholder="Batch Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button>Add</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Start</th>
            <th>End</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {batches.map((b, i) => (
            <tr key={b.id}>
              <td>{i + 1}</td>
              <td>{b.name}</td>
              <td>{b.startDate}</td>
              <td>{b.endDate}</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => openEdit(b)}>Edit</button>
                  <button className="delete-btn" onClick={() => deactivate(b.id)}>Deactivate</button>
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
            <h3>Edit Batch</h3>

            <form onSubmit={updateBatch}>
              <input value={editData.name}
                onChange={e => setEditData({...editData, name: e.target.value})}
              />

              <input type="date" value={editData.startDate}
                onChange={e => setEditData({...editData, startDate: e.target.value})}
              />

              <input type="date" value={editData.endDate}
                onChange={e => setEditData({...editData, endDate: e.target.value})}
              />

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

export default Batch;