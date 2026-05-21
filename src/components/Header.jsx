// Header.jsx - Main top navigation bar with User authentication feedback, theme switches, and Time Machine fast forward controls
import React from "react";
import { Megaphone, Map, BarChart3, Sun, Moon, Plus, LogIn, LogOut, ShieldAlert, FastForward, User, RotateCcw } from "lucide-react";
import { isUserAdmin } from "../utils/storage";

export default function Header({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  onOpenReport,
  currentUser,
  onLogout,
  onOpenAuth,
  onFastForwardTime,
  simulatedDaysAged,
  onResetSimulation
}) {
  const tabs = [
    { id: "feed", label: "Feed", icon: Megaphone },
    { id: "map", label: "Map View", icon: Map }
  ];

  if (currentUser && isUserAdmin(currentUser)) {
    tabs.push({ id: "insights", label: "Insights", icon: BarChart3 });
  }

  return (
    <header className="header-glass glass">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="brand" onClick={() => setActiveTab("feed")}>
          <div className="brand-icon pulse-glow">
            <Megaphone size={20} color="white" />
          </div>
          <div className="brand-text">
            <span className="brand-main">UrbanEye</span>
            <span className="brand-sub">Smart Grievance Portal</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Authentication Status */}
        <div className="header-actions">
          {/* Time Machine Simulator Badge */}
          {onFastForwardTime && (
            <div className="time-machine-container">
              {simulatedDaysAged > 0 ? (
                <>
                  <span className="time-aged-badge">
                    +{simulatedDaysAged}d Warp
                  </span>
                  <button
                    onClick={onResetSimulation}
                    className="action-btn time-warp-btn"
                    style={{ background: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.4)" }}
                    title="Reset Simulation (Restore original database state)"
                  >
                    <RotateCcw size={16} />
                    <span className="action-btn-text">Reset Warp</span>
                  </button>
                </>
              ) : null}
              <button
                onClick={() => onFastForwardTime(7)}
                className="action-btn time-warp-btn"
                title="Fast Forward Time by 7 Days (Triggers Starvation Aging!)"
              >
                <FastForward size={16} />
                <span className="action-btn-text">Age +7 Days</span>
              </button>
            </div>
          )}

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="action-btn theme-toggle"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Citizen / Admin Account Status */}
          {currentUser ? (
            <div className="user-profile-widget">
              <div className="user-info-text">
                <span className="user-name-label">
                  {currentUser.role === "admin" ? "🛠️ Administrator" : currentUser.name}
                </span>
                <span className={`user-role-badge ${currentUser.role}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              
              <button onClick={onLogout} className="action-btn logout-btn" title="Logout Account">
                <LogOut size={16} />
              </button>

              {/* Action Button - Disabled if not logged in */}
              {!isUserAdmin(currentUser) && (
                <button onClick={onOpenReport} className="btn-primary ripple-hover">
                  <Plus size={18} />
                  <span>Report Issue</span>
                </button>
              )}
            </div>
          ) : (
            <div className="auth-widget">
              <button onClick={onOpenAuth} className="btn-secondary ripple-hover">
                <LogIn size={16} />
                <span>Verify Citizen</span>
              </button>

              <button 
                onClick={onOpenAuth} 
                className="btn-primary disabled-btn" 
                title="Please login/verify identity first to prevent false complaints"
              >
                <Plus size={18} />
                <span>Report Issue</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .header-glass {
          position: fixed;
          top: 16px;
          left: 16px;
          right: 16px;
          height: 68px;
          z-index: 1000;
          border-radius: 14px;
          padding: 0 20px;
          transition: background var(--transition-normal), border var(--transition-normal);
        }

        .header-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          max-width: 1360px;
          margin: 0 auto;
          gap: 16px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex: 1;
          min-width: max-content;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-color), #818cf8);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
          flex-shrink: 0;
        }

        .brand-main {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 17px;
          letter-spacing: -0.01em;
        }

        .brand-sub {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .nav-tabs {
          display: flex;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          gap: 2px;
          flex-shrink: 0;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        [data-theme="light"] .tab-btn:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .tab-btn.active {
          color: white;
          background: var(--accent-color);
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex: 1;
          min-width: max-content;
        }

        .time-machine-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .time-aged-badge {
          background: var(--color-seriousness-high);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
        }

        .time-warp-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          width: auto !important;
          padding: 0 10px;
          border-color: rgba(234, 179, 8, 0.3) !important;
          background: rgba(234, 179, 8, 0.05) !important;
          color: var(--color-seriousness-medium) !important;
        }

        .time-warp-btn:hover {
          background: rgba(234, 179, 8, 0.15) !important;
          border-color: var(--color-seriousness-medium) !important;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-muted);
          transform: translateY(-1px);
        }

        .logout-btn {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.05);
          color: var(--color-seriousness-critical);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--color-seriousness-critical);
        }

        .user-profile-widget {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.15);
          border: 1px solid var(--border-color);
          padding: 4px 6px 4px 12px;
          border-radius: 12px;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.1;
        }

        .user-name-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 1px 4px;
          border-radius: 4px;
        }

        .user-role-badge.citizen {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-seriousness-low);
        }

        .user-role-badge.admin {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-color);
        }

        .auth-widget {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          border-color: var(--text-muted);
          background: var(--bg-input);
          transform: translateY(-1px);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          border-radius: 10px;
          background: var(--accent-color);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .btn-primary:hover:not(.disabled-btn) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px var(--accent-glow);
        }

        .disabled-btn {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .user-info-text, .action-btn-text {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .brand-sub, .tab-label, .btn-primary span, .btn-secondary span {
            display: none;
          }
          
          .header-glass {
            top: 8px;
            left: 8px;
            right: 8px;
            height: 60px;
            padding: 0 10px;
          }
          
          .nav-tabs {
            position: static;
            transform: none;
            gap: 0;
          }
          
          .tab-btn {
            padding: 8px 10px;
          }
          
          .btn-primary, .btn-secondary {
            padding: 0 10px;
          }
        }
      `}</style>
    </header>
  );
}
