import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import "./Users.css";

const Users = () => {

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const token = localStorage.getItem("token");

  const headers = useMemo(() => ({
    "Content-Type": "application/json", // 🔥 IMPORTANT FIX
    Authorization: `Bearer ${token}`
  }), [token]);

  // 🔥 FETCH USERS
  const fetchUsers = useCallback(() => {
  fetch("http://localhost:8080/users", { headers })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [headers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 🔥 ADD USER
  const addUser = (e) => {
    e.preventDefault();

    // 🔥 VALIDATION
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
      body: JSON.stringify({ name, email, password, role })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        toast.success("User created successfully 🚀");
        fetchUsers();
        setName("");
        setEmail("");
        setPassword("");
      })
      .catch(() => {
        toast.error("Failed to create user ❌");
      });
  };

  // 🔥 DELETE USER
  const deactivateUser = (id) => {
    fetch(`http://localhost:8080/users/deactivate/${id}`, {
      method: "PUT",
      headers
    })
      .then(res => res.text())
      .then(() => {
        toast.success("User deactivated ⚡");
        fetchUsers();
      })
      .catch(() => {
        toast.error("Failed to deactivate ❌");
      });
  };

  return (
    <div className="users-container">

      <h2>Users Management</h2>

      {/* ADD USER FORM */}
      <form onSubmit={addUser} className="user-form">
        <input placeholder="Name" value={name} required onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} required onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} required onChange={e => setPassword(e.target.value)} />

        <select value={role} onChange={e => setRole(e.target.value)}>
          <option>ADMIN</option>
          <option>EVALUATOR</option>
        </select>

        <button type="submit">Add User</button>
      </form>

      {/* USERS TABLE */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => deactivateUser(user.id)}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

export default Users;