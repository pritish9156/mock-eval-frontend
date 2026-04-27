import React, { useEffect, useState } from "react";
import "./Users.css";

const Users = () => {

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // 🔥 FETCH USERS
  const fetchUsers = () => {
    fetch("http://localhost:8080/users", { headers })
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 ADD USER
  const addUser = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/users", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, email, password, role })
    })
      .then(() => {
        fetchUsers();
        setName("");
        setEmail("");
        setPassword("");
      });
  };

  // 🔥 DELETE USER
  const deleteUser = (id) => {
    fetch(`http://localhost:8080/users/${id}`, {
      method: "DELETE",
      headers
    }).then(fetchUsers);
  };

  return (
    <div className="users-container">

      <h2>Users Management</h2>

      {/* ADD USER FORM */}
      <form onSubmit={addUser} className="user-form">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

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
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

export default Users;