import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import "./Users.css";

const Technology = () => {

  const [techs, setTechs] = useState([]);
  const [name, setName] = useState("");
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

  const fetchTechs = useCallback(() => {
    fetch("http://localhost:8080/technology", { headers })
      .then(handleResponse)
      .then(data => setTechs(data || []))
      .catch(() => toast.error("Failed ❌"));
  }, [headers]);

  useEffect(() => {
    fetchTechs();
  }, [fetchTechs]);

  // ADD
  const addTech = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name required ❌");
      return;
    }

    fetch("http://localhost:8080/technology", {
      method: "POST",
      headers,
      body: JSON.stringify({ name })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        toast.success("Added 🚀");
        setName("");
        fetchTechs();
      })
      .catch(() => toast.error("Failed ❌"));
  };

  // EDIT
  const openEdit = (t) => setEditData({ ...t });

  const updateTech = (e) => {
    e.preventDefault();

    fetch(`http://localhost:8080/technology/${editData.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(editData)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        toast.success("Updated ✅");
        setEditData(null);
        fetchTechs();
      })
      .catch(() => toast.error("Failed ❌"));
  };

  // DEACTIVATE
  const deactivate = (id) => {
    fetch(`http://localhost:8080/technology/deactivate/${id}`, {
      method: "PUT",
      headers
    })
      .then(res => {
        if (!res.ok) throw new Error();
        toast.success("Deactivated ⚡");
        fetchTechs();
      })
      .catch(() => toast.error("Failed ❌"));
  };

  return (
    <div className="users-container">
      <h2>Technology Management</h2>

      <form onSubmit={addTech} className="user-form">
        <input value={name} onChange={e => setName(e.target.value)} />
        <button>Add</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {techs.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.name}</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => openEdit(t)}>Edit</button>
                  <button className="delete-btn" onClick={() => deactivate(t.id)}>Deactivate</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Technology</h3>

            <form onSubmit={updateTech}>
              <input value={editData.name}
                onChange={e => setEditData({...editData, name: e.target.value})}
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

export default Technology;