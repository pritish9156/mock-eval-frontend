import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import "./Users.css";

const Users = () => {

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }), [token]);

  // 🔥 FETCH USERS (only evaluators)
  const fetchUsers = useCallback(() => {
    fetch("http://localhost:8080/users", { headers })
      .then(res => res.json())
      .then(data => {
        // 🔥 filter only evaluators
        const evaluators = data.filter(u => u.role === "EVALUATOR");
        setUsers(evaluators);
      });
  }, [headers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 🔥 ADD EVALUATOR
  const addUser = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required ❌");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Enter valid email ❌");
      return;
    }

    fetch("http://localhost:8080/users", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        email,
        password,
        role: "EVALUATOR" // 🔥 FIXED ROLE
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        toast.success("Evaluator created successfully 🚀");
        fetchUsers();
        setName("");
        setEmail("");
        setPassword("");
      })
      .catch(() => {
        toast.error("Failed to create evaluator ❌");
      });
  };

  const openEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const updateUser = (e) => {
    e.preventDefault();

    // 🔥 VALIDATION
    if (!editUser.name.trim() || !editUser.email.trim()) {
      toast.error("Name and Email are required ❌");
      return;
    }

    if (!editUser.email.includes("@")) {
      toast.error("Enter valid email ❌");
      return;
    }

    // Optional: password check (only if changed)
    if (editUser.password && editUser.password.length < 4) {
      toast.error("Password must be at least 4 characters ❌");
      return;
    }

    fetch(`http://localhost:8080/users/${editUser.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: editUser.name,
        email: editUser.email,
        role: "EVALUATOR",
        ...(editUser.password ? { password: editUser.password } : {})
      })
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text(); // 🔥 get backend message
          throw new Error(text || "Update failed");
        }
        return res.json();
      })
      .then(() => {
        toast.success("Evaluator updated successfully ✅");
        setShowModal(false);
        fetchUsers();
      })
      .catch((err) => {
        toast.error(err.message || "Update failed ❌");
      });
  };

  const confirmDeactivate = () => {
    fetch(`http://localhost:8080/users/deactivate/${selectedUserId}`, {
      method: "PUT",
      headers
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(() => {
        toast.success("Evaluator deactivated ⚡");
        setConfirmOpen(false);
        fetchUsers();
      })
      .catch(() => {
        toast.error("Failed to deactivate ❌");
      });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">

      <h2>Evaluator Management</h2>

      {/* ADD EVALUATOR FORM */}
      <form onSubmit={addUser} className="user-form">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

        <button type="submit">Add Evaluator</button>
      </form>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => openEdit(user)}>
                  Edit
                </button>

                <button 
                  className="delete-btn"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setConfirmOpen(true);
                  }}
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Edit Evaluator</h3>

            <form onSubmit={updateUser}>

              <div className="input-group">
                <label>Name</label>
                <input
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  onChange={(e) =>
                    setEditUser({ ...editUser, password: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="update-btn">Update</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">

            <h3>Deactivate Evaluator?</h3>

            <div className="confirm-actions">
              <button className="danger-btn" onClick={confirmDeactivate}>
                Yes
              </button>

              <button className="cancel-btn" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Users;