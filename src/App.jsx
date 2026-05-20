// App.jsx - Main Application Controller, Session Manager & Dynamic Grievance Aging Engine
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ComplaintFeed from "./components/ComplaintFeed";
import InteractiveMap from "./components/InteractiveMap";
import Leaderboard from "./components/Leaderboard";
import Dashboard from "./components/Dashboard";
import AuthModal from "./components/AuthModal";
import ReportModal from "./components/ReportModal";
import ComplaintDetails from "./components/ComplaintDetails";
import { 
  User, 
  Lock, 
  UserPlus, 
  ShieldCheck, 
  Megaphone, 
  Sun, 
  Moon, 
  Sparkles, 
  MapPin, 
  Activity, 
  CheckCircle,
  Calendar,
  Zap,
  ArrowRight
} from "lucide-react";

import { 
  getComplaints, 
  saveComplaints, 
  getStoredTheme, 
  saveStoredTheme, 
  getStoredSession, 
  saveSession, 
  clearSession,
  getSimulatedAgedDays,
  saveSimulatedAgedDays,
  getStoredUsers,
  saveUsers,
  getAdminInfoFromRole
} from "./utils/storage";

export function LandingGate({ onLoginSuccess, theme, toggleTheme }) {
  const [tab, setTab] = useState("login"); // login | signup | admin
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (tab === "admin") {
      const users = getStoredUsers();
      const adminUser = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password && u.role !== "citizen"
      );
      
      const isSuperAdmin = username.toLowerCase() === "admin" && password === "admin";

      if (isSuperAdmin) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess({ name: "Government Administrator", role: "admin", username: "admin" });
        }, 800);
      } else if (adminUser) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(adminUser);
        }, 800);
      } else {
        setError("Invalid administrator credentials.");
      }
    } else if (tab === "login") {
      const users = getStoredUsers();
      const user = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (user) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 800);
      } else {
        setError("Invalid username or password.");
      }
    } else if (tab === "signup") {
      if (!name) {
        setError("Please enter your full name.");
        return;
      }

      const users = getStoredUsers();
      const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());

      if (exists) {
        setError("Username already exists.");
        return;
      }

      const newUser = { name, username, password, role: "citizen" };
      saveUsers([...users, newUser]);
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 800);
    }
  };

  return (
    <div className="landing-gate-viewport animate-fade-in">
      {/* Top Glass Header */}
      <header className="landing-header glass">
        <div className="brand">
          <div className="brand-icon pulse-glow">
            <Megaphone size={20} color="white" />
          </div>
          <div className="brand-text">
            <span className="brand-main">UrbanEye</span>
            <span className="brand-sub">Smart Grievance Portal</span>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="action-btn theme-toggle"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Hero Core Section Grid */}
      <div className="landing-grid-container">
        
        {/* Left Column: Premium Value Pitch Cards */}
        <div className="pitch-column">
          <div className="pitch-intro">
            <span className="badge-pill">🛡️ SECURE CIVIC ENGAGEMENT</span>
            <h1>Kerala's Next-Generation Smart Unified Grievance Platform</h1>
            <p>
              UrbanEye merges real-time public complaints with an autonomous route-scheduling and dispatch optimizer. 
              Say goodbye to administrative stagnation and falsified reports.
            </p>
          </div>

          <div className="pitch-cards">
            {/* Card 1 */}
            <div className="pitch-card glass">
              <div className="card-icon-box priority">
                <Sparkles size={20} />
              </div>
              <div className="card-content">
                <h3>Autonomous Urgency Scheduling & Aging</h3>
                <p>
                  Urgent tickets (Critical/High) automatically schedule resolutions in 2-5 days. 
                  Low-priority tickets age dynamically over time to prevent resource starvation.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="pitch-card glass">
              <div className="card-icon-box proximity">
                <MapPin size={20} />
              </div>
              <div className="card-content">
                <h3>Proximity Route Optimizer</h3>
                <p>
                  Aggregates minor tickets in the same geographical vicinity into a single unified route, 
                  allowing dispatch crews to solve adjacent civic issues atomically in one trip.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="pitch-card glass">
              <div className="card-icon-box verification">
                <Activity size={20} />
              </div>
              <div className="card-content">
                <h3>Verified WhatsApp Pipeline</h3>
                <p>
                  Empowers citizens to file grievances directly via standard chat bots, 
                  enforced by 4-digit SMS OTP verification sessions to fully verify sender identity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Login Verification Gate */}
        <div className="login-column">
          <div className="login-card glass animate-slide-up">
            
            {/* Header info */}
            <div className="login-card-header">
              <h2>Portal Identity Verification</h2>
              <p>Log in or create a secure account to access the live dashboard</p>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <button
                onClick={() => { setTab("login"); setError(""); }}
                className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
              >
                <User size={14} />
                <span>Citizen Login</span>
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
                <span>Admin Console</span>
              </button>
            </div>

            {/* Form */}
            {success ? (
              <div className="login-success-state">
                <CheckCircle size={48} className="success-pulse" />
                <h3>Session Authenticated</h3>
                <p>Verifying digital credentials. Redirecting to live feeds...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error-alert">{error}</div>}

                {tab === "signup" && (
                  <div className="form-group">
                    <label htmlFor="landing-name">Full Name</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input
                        id="landing-name"
                        type="text"
                        placeholder="e.g. Anand Krishna"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="landing-username">
                    {tab === "admin" ? "Admin Identifier" : "Username"}
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      id="landing-username"
                      type="text"
                      placeholder={tab === "admin" ? "e.g. admin" : "e.g. citizen"}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoCapitalize="none"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="landing-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="landing-password"
                      type="password"
                      placeholder={tab === "admin" ? "••••••••" : "e.g. 123"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {tab === "admin" && (
                  <p className="admin-notice">
                    ⚠️ Authorized Personnel Only. Use role-specific credentials (e.g. <code>panchayath_road</code> / <code>123</code> or <code>admin</code> / <code>admin</code>).
                  </p>
                )}

                <button type="submit" className="auth-submit-btn ripple-hover pulse-glow">
                  <span>
                    {tab === "login" ? "Verify Credentials" : tab === "signup" ? "Create Account" : "Access Admin Console"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Quick credentials hint */}
            <div className="login-footer-hint">
              <p>💡 Tip: Use guest login credentials <code>citizen</code> / <code>123</code> or <code>admin</code> / <code>admin</code> to explore immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .landing-gate-viewport {
          min-height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          background-color: var(--bg-primary);
          z-index: 2000;
          overflow-y: auto;
          padding: 100px 24px 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-header {
          position: fixed;
          top: 16px;
          left: 16px;
          right: 16px;
          height: 68px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 14px;
          z-index: 2010;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px var(--accent-glow);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-main {
          font-family: var(--font-heading);
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .brand-sub {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .action-btn.theme-toggle {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          transition: background var(--transition-fast);
        }

        .action-btn.theme-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .landing-grid-container {
          max-width: 1200px;
          width: 100%;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          margin: 0 auto;
          align-items: center;
        }

        .pitch-column {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .pitch-intro {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .badge-pill {
          background: var(--accent-glow);
          color: var(--accent-color);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          width: max-content;
          border: 1px solid rgba(99, 102, 241, 0.2);
          letter-spacing: 0.05em;
        }

        .pitch-intro h1 {
          font-family: var(--font-heading);
          font-size: 38px;
          font-weight: 800;
          line-height: 1.15;
          background: linear-gradient(135deg, var(--text-primary) 40%, var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pitch-intro p {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.6;
        }

        .pitch-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pitch-card {
          display: flex;
          gap: 18px;
          padding: 20px;
          align-items: flex-start;
          transition: transform var(--transition-fast);
        }

        .pitch-card:hover {
          transform: translateX(4px);
        }

        .card-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-icon-box.priority {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        .card-icon-box.proximity {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
        }

        .card-icon-box.verification {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .card-content h3 {
          font-size: 15px;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .card-content p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .login-column {
          display: flex;
          justify-content: flex-end;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 36px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-card-header h2 {
          font-size: 24px;
          margin-bottom: 6px;
        }

        .login-card-header p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Shared Authentication Form Classes */
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
          padding: 10px 4px;
          border-radius: 6px;
          font-size: 11.5px;
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
          gap: 16px;
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
          text-align: left;
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
          left: 14px;
          color: var(--text-muted);
        }

        .input-with-icon input {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 14px 12px 42px;
          font-size: 14px;
          height: 46px;
          color: var(--text-primary);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .admin-notice {
          font-size: 12px;
          color: var(--color-seriousness-medium);
          line-height: 1.4;
          background: rgba(234, 179, 8, 0.08);
          border-radius: 6px;
          padding: 8px 10px;
          border: 1px dashed rgba(234, 179, 8, 0.2);
          text-align: left;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .auth-submit-btn:hover {
          background: var(--accent-hover);
        }

        .login-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 0;
          gap: 16px;
        }

        .success-pulse {
          color: var(--color-resolved);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        .login-success-state h3 {
          font-size: 18px;
          color: var(--color-resolved);
        }

        .login-success-state p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .login-footer-hint {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: 8px;
        }

        .login-footer-hint p {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.4;
          text-align: center;
        }

        @media (max-width: 992px) {
          .landing-grid-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          
          .landing-gate-viewport {
            padding-top: 110px;
          }
          
          .login-column {
            justify-content: center;
          }
          
          .pitch-intro h1 {
            font-size: 32px;
          }
        }

        @media (max-width: 576px) {
          .landing-gate-viewport {
            padding: 90px 16px 40px;
          }
          
          .login-card {
            padding: 24px;
          }
          
          .auth-tabs {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  // Global States
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("feed");
  const [complaints, setComplaints] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [simulatedDaysAged, setSimulatedDaysAged] = useState(0);

  // Modals Overlay Visibility
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Micro-animation indicator for time-warp warp
  const [isTimeWarping, setIsTimeWarping] = useState(false);

  // Centralized filtering of complaints based on currentUser role
  const getVisibleComplaints = () => {
    if (!currentUser) return [];
    
    // Legacy admin is a Super Admin: sees everything
    if (currentUser.role === "admin" || currentUser.role === "ADMIN") {
      return complaints;
    }
    
    // Check if user is a departmental admin
    const adminInfo = getAdminInfoFromRole(currentUser.role);
    if (adminInfo) {
      return complaints.filter(
        (c) => c.hierarchyLevel === adminInfo.level && c.assignedDepartment === adminInfo.department
      );
    }
    
    return complaints;
  };
  
  const visibleComplaints = getVisibleComplaints();

  // 1. Initial Mount: Load Theme, Session, and run Aging calculation
  useEffect(() => {
    // Theme setup
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);

    // Session setup
    const session = getStoredSession();
    setCurrentUser(session);

    // Aging offset setup
    const agedDays = getSimulatedAgedDays();
    setSimulatedDaysAged(agedDays);

    // Load complaints and run the aging engine
    const rawComplaints = getComplaints();
    const agedComplaints = runAgingEngine(rawComplaints, agedDays);
    setComplaints(agedComplaints);
    saveComplaints(agedComplaints);
  }, []);

  // 2. Starvation Prevention & Aging Algorithm
  const runAgingEngine = (list, customAgedDays = null) => {
    const priorities = ["low", "medium", "high", "critical"];
    const targetAgedDays = customAgedDays !== null ? customAgedDays : simulatedDaysAged;

    return list.map((c) => {
      if (c.status === "resolved") return c; // resolved issues are frozen

      // Calculate effective simulated age in days:
      const isPreSeeded = typeof c.id === "string" && /^c\d+$/.test(c.id);
      const ageDays = isPreSeeded 
        ? targetAgedDays 
        : Math.max(0, targetAgedDays - (c.simulatedDaysAtCreation || 0));

      // Start with original seriousness/priority
      let newSeriousness = c.originalSeriousness || c.seriousness || "medium";
      
      // Calculate priority progression (boosted by 1 level for every 7 days)
      const steps = Math.floor(ageDays / 7);
      if (steps > 0) {
        let currentIndex = priorities.indexOf(newSeriousness);
        if (currentIndex !== -1) {
          const newIndex = Math.min(priorities.length - 1, currentIndex + steps);
          newSeriousness = priorities[newIndex];
        }
      }

      // Start with original hierarchy level manually set or defaulted
      let newLevel = c.originalHierarchyLevel || c.hierarchyLevel || "panchayath";
      
      // Filter out previous automated system logs to avoid duplicates or orphans when resetting
      const logs = (c.escalationLogs || []).filter(
        log => log.byUser !== "System Automated Escalation Engine"
      );

      // Automated Governance Escalation Gates
      if (ageDays > 10) {
        if (newLevel !== "state") {
          logs.push({
            timestamp: Date.now(),
            byUser: "System Automated Escalation Engine",
            details: `Automated escalation to STATE level due to unresolved ticket age (> 10 days).`
          });
          newLevel = "state";
        }
      } else if (ageDays > 5) {
        if (newLevel === "panchayath") {
          logs.push({
            timestamp: Date.now(),
            byUser: "System Automated Escalation Engine",
            details: `Automated escalation from PANCHAYATH to DISTRICT level due to unresolved ticket age (> 5 days).`
          });
          newLevel = "district";
        }
      }

      return {
        ...c,
        seriousness: newSeriousness,
        hierarchyLevel: newLevel,
        escalationLogs: logs
      };
    });
  };

  // 3. Fast Forward Time Warp Simulator (+7 days pass)
  const handleFastForwardTime = (days) => {
    setIsTimeWarping(true);

    const newAgedDays = simulatedDaysAged + days;
    setSimulatedDaysAged(newAgedDays);
    saveSimulatedAgedDays(newAgedDays);

    // Shift ALL unresolved complaints' createdAt back in history by 7 days
    const shifted = complaints.map((c) => {
      if (c.status === "resolved") return c;
      return {
        ...c,
        createdAt: c.createdAt - days * 24 * 3600 * 1000
      };
    });

    // Feed through the aging promotion checker
    const aged = runAgingEngine(shifted, newAgedDays);
    setComplaints(aged);
    saveComplaints(aged);

    // If an overlay detail is active, update its reference in state as well
    if (selectedComplaint) {
      const activeObj = aged.find(c => c.id === selectedComplaint.id);
      if (activeObj) setSelectedComplaint(activeObj);
    }

    // Reset visual flash after animation plays out
    setTimeout(() => {
      setIsTimeWarping(false);
    }, 2000);
  };

  const handleResetSimulation = () => {
    setIsTimeWarping(true);
    setSimulatedDaysAged(0);
    saveSimulatedAgedDays(0);
    
    // Clear localized complaints key to restore original pristine seed data state
    localStorage.removeItem("urbaneye_complaints");
    const fresh = getComplaints();
    const aged = runAgingEngine(fresh);
    setComplaints(aged);
    saveComplaints(aged);
    
    if (selectedComplaint) {
      const activeObj = aged.find(c => c.id === selectedComplaint.id);
      setSelectedComplaint(activeObj || null);
    }
    
    setTimeout(() => {
      setIsTimeWarping(false);
    }, 1500);
  };

  // 4. Global Action Handlers
  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    saveSession(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearSession();
    setActiveTab("feed");
  };

  const handleNewComplaintSubmit = (newComp) => {
    const enriched = {
      ...newComp,
      simulatedDaysAtCreation: simulatedDaysAged
    };
    // Run aging check on the fresh submission list
    const updated = [enriched, ...complaints];
    const aged = runAgingEngine(updated);
    setComplaints(aged);
    saveComplaints(aged);
  };

  const handleUpdateComplaint = (updates) => {
    const updateList = Array.isArray(updates) ? updates : [updates];
    const updateMap = new Map(updateList.map(u => [u.id, u]));

    const updatedList = complaints.map(c => {
      if (updateMap.has(c.id)) {
        return updateMap.get(c.id);
      }
      return c;
    });

    const aged = runAgingEngine(updatedList);
    setComplaints(aged);
    saveComplaints(aged);

    // Sync details popup if active
    if (selectedComplaint) {
      const activeObj = aged.find(c => c.id === selectedComplaint.id);
      if (activeObj) setSelectedComplaint(activeObj);
    }
  };

  const handleUpvote = (id) => {
    if (!currentUser) {
      setAuthModalOpen(true); // Open authentication modal if guest tries to upvote
      return;
    }

    const updated = complaints.map(c => {
      if (c.id === id) {
        const upvotedByList = c.upvotedBy || [];
        const hasVoted = upvotedByList.includes(currentUser.username);
        
        if (hasVoted) {
          return {
            ...c,
            upvotes: Math.max(0, (c.upvotes || 1) - 1),
            upvotedBy: upvotedByList.filter(username => username !== currentUser.username)
          };
        } else {
          return {
            ...c,
            upvotes: (c.upvotes || 0) + 1,
            upvotedBy: [...upvotedByList, currentUser.username]
          };
        }
      }
      return c;
    });

    setComplaints(updated);
    saveComplaints(updated);

    // Sync details popup if active
    if (selectedComplaint && selectedComplaint.id === id) {
      const activeObj = updated.find(c => c.id === id);
      setSelectedComplaint(activeObj);
    }
  };

  const handleOpenComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  if (!currentUser) {
    return (
      <LandingGate 
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        toggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className={`app-container ${isTimeWarping ? "time-warped" : ""}`}>
      {/* Dynamic Header navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={handleToggleTheme}
        onOpenReport={() => setReportModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        onFastForwardTime={handleFastForwardTime}
        simulatedDaysAged={simulatedDaysAged}
        onResetSimulation={handleResetSimulation}
      />

      {/* Main Tab Routing */}
      <main className="main-content-tab-window animate-fade-in">
        {activeTab === "feed" && (
          <ComplaintFeed
            complaints={visibleComplaints}
            onComplaintClick={handleOpenComplaintDetails}
            onUpvote={handleUpvote}
            currentUser={currentUser}
          />
        )}

        {activeTab === "map" && (
          <InteractiveMap
            complaints={visibleComplaints}
            onComplaintClick={handleOpenComplaintDetails}
            theme={theme}
          />
        )}

        {activeTab === "leaderboard" && (
          <Leaderboard
            complaints={visibleComplaints}
          />
        )}

        {activeTab === "insights" && (
          <Dashboard
            complaints={visibleComplaints}
          />
        )}
      </main>

      {/* Global Modals Overlays */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onNewComplaint={handleNewComplaintSubmit}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {selectedComplaint && (
        <ComplaintDetails
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          currentUser={currentUser}
          allComplaints={complaints}
          onUpdateComplaint={handleUpdateComplaint}
          onUpvote={handleUpvote}
        />
      )}

      {/* Floating warning during simulated time shifts */}
      {isTimeWarping && (
        <div className="time-warp-alert-overlay animate-fade-in">
          <div className="alert-warp-card glass">
            <h3>⏳ WARPING TIME MATRIX...</h3>
            <p>Advancing active citizen records by +7 days. Starvation prevention protocols computing...</p>
          </div>
        </div>
      )}

      <style>{`
        .main-content-tab-window {
          margin-top: 12px;
          min-height: calc(100vh - 180px);
        }

        .time-warp-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-warp-card {
          padding: 32px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 440px;
          border-color: var(--color-seriousness-medium) !important;
          box-shadow: 0 0 30px var(--accent-glow) !important;
        }

        .alert-warp-card h3 {
          color: var(--color-seriousness-medium);
          font-size: 20px;
          letter-spacing: 0.05em;
        }

        .alert-warp-card p {
          color: var(--text-primary);
          font-size: 13.5px;
          line-height: 1.5;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn var(--transition-normal) forwards;
        }
      `}</style>
    </div>
  );
}
