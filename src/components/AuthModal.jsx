// AuthModal.jsx - Citizen and Admin login/signup form
import React, { useState } from "react";
import { X, User, Lock, UserPlus, ShieldCheck } from "lucide-react";
import { apiLogin, apiSignup } from "../utils/api";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState("login"); // login | signup | admin
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      if (tab === "admin") {
        const user = await apiLogin(username, password);
        if (user.role === "citizen") {
          setError("Authorized administrator account required.");
          return;
        }
        onLoginSuccess(user);
        onClose();
        resetForm();
      } else if (tab === "login") {
        const user = await apiLogin(username, password);
        onLoginSuccess(user);
        onClose();
        resetForm();
      } else if (tab === "signup") {
        if (!name) {
          setError("Please enter your full name.");
          return;
        }
        const newUser = await apiSignup(name, username, password);
        onLoginSuccess(newUser);
        onClose();
        resetForm();
      }
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    }
  };

  const resetForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal glass animate-fade-in">
        {/* Header */}
        <div className="auth-header">
          <h3>Portal Verification</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close authentication">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="auth-tabs">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
          >
            <User size={14} />
            <span>Login</span>
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`auth-tab-btn ${tab === "signup" ? "active" : ""}`}
          >
            <UserPlus size={14} />
            <span>Sign Up</span>
          </button>
          <button
            onClick={() => { setTab("admin"); setError(""); }}
            className={`auth-tab-btn ${tab === "admin" ? "active" : ""}`}
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-alert">{error}</div>}

          {tab === "signup" && (
            <div className="form-group">
              <label htmlFor="name-input">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="name-input"
                  type="text"
                  placeholder="e.g. Ashwin Madhavan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username-input">
              {tab === "admin" ? "Admin Identifier" : "Username"}
            </label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                id="username-input"
                type="text"
                placeholder={tab === "admin" ? "e.g. admin" : "e.g. citizen"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="password-input"
                type="password"
                placeholder={tab === "admin" ? "••••••••" : "e.g. 123"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {tab === "admin" && (
            <p className="admin-notice">
              ⚠️ Authorized Personnel Only. Use role-specific credentials (e.g. <code>panchayath_road</code> / <code>123</code> or <code>admin</code> / <code>admin</code>).
            </p>
          )}

          <button type="submit" className="auth-submit-btn ripple-hover pulse-glow">
            {tab === "login" ? "Verify Credentials" : tab === "signup" ? "Create Account" : "Access Admin Console"}
          </button>
        </form>
      </div>

      <style>{`
        .auth-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(5, 7, 16, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .auth-modal {
          width: 100%;
          max-width: 420px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .auth-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .auth-header h3 {
          font-size: 20px;
          font-weight: 700;
        }

        .close-btn {
          color: var(--text-muted);
          transition: color var(--transition-fast);
          padding: 4px;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 4px;
          border: 1px solid var(--border-color);
        }

        .auth-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 4px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color var(--transition-fast), background var(--transition-fast);
        }

        .auth-tab-btn.active {
          color: var(--text-primary);
          background: var(--bg-input);
          border: 1px solid var(--border-color);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .auth-error-alert {
          background: rgba(239, 68, 68, 0.15);
          color: var(--color-seriousness-critical);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .input-with-icon input {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px 10px 38px;
          font-size: 14px;
          transition: border var(--transition-fast);
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: var(--border-focus);
        }

        .admin-notice {
          font-size: 12px;
          color: var(--color-seriousness-medium);
          line-height: 1.4;
          background: rgba(234, 179, 8, 0.08);
          border-radius: 6px;
          padding: 8px 10px;
          border: 1px dashed rgba(234, 179, 8, 0.2);
        }

        .auth-submit-btn {
          width: 100%;
          background: var(--accent-color);
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 6px;
          transition: background var(--transition-fast);
        }

        .auth-submit-btn:hover {
          background: var(--accent-hover);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn var(--transition-normal) forwards;
        }
      `}</style>
    </div>
  );
}
