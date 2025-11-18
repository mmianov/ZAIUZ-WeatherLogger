import React, { useState } from "react";
import api from "../api/api";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { username, password });
      onLogin(res.data.token, res.data.role);
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="text-center mt-5">
      <h3>Login</h3>
      <form onSubmit={handleSubmit} className="d-inline-block text-start" style={{ maxWidth: "300px" }}>
        <div className="mb-3">
          <label>Username</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger p-1 text-center">{error}</div>}
        <button className="btn btn-primary w-100" type="submit">Login</button>
      </form>
    </div>
  );
}
