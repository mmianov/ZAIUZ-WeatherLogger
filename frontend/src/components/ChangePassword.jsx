import React, { useState } from "react";
import api from "../api/api";

export default function ChangePassword() {
  const [open, setOpen] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    if (!oldPass || !newPass) {
      setMsg("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post("/change_password", {
        old_password: oldPass,
        new_password: newPass,
      });

      setMsg("Password updated successfully ✔");
      setOldPass("");
      setNewPass("");
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.msg || "Failed to update"));
    }
  };

  return (
    <div className="bg-secondary p-3 rounded mt-4">

      <button
        className="btn btn-outline-light w-100 text-start"
        onClick={() => setOpen(!open)}
      >
        {open ? "▼ Hide password settings" : "► Change admin password"}
      </button>

      {open && (
        <div className="mt-3 border-top pt-3">
          <h5 className="mb-3">Change Admin Password</h5>

          <div className="d-flex flex-column gap-2">
            <input
              type="password"
              className="form-control"
              placeholder="Old password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />

            <input
              type="password"
              className="form-control"
              placeholder="New password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />

            <button className="btn btn-light mt-2" onClick={handleSubmit}>
              Update Password
            </button>

            {msg && <div className="text-warning">{msg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
