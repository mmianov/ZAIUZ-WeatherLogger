import React, { useState } from "react";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [view, setView] = useState("dashboard"); // "dashboard" | "login"

  const handleLogin = (t, r) => {
    localStorage.setItem("token", t);
    localStorage.setItem("role", r);
    setToken(t);
    setRole(r);
    setView("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setView("dashboard");
  };

  return (
    <div className="bg-dark text-light min-vh-100">
      <Navbar
        role={role}
        onLogout={handleLogout}
        onLoginClick={() => setView("login")}
        onBrandClick={() => setView("dashboard")}

      />

      <div className="container-fluid py-4 mt-5">
        {view === "login" ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "70vh" }}
          >
            <div
              className="bg-secondary p-4 rounded"
              style={{ maxWidth: "350px", width: "100%" }}
            >
              <LoginForm onLogin={handleLogin} />


              <button
                className="btn btn-outline-light w-100 mt-3"
                onClick={() => setView("dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <Dashboard />
            {role === "admin" && <AdminPanel />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
