// ComplaintFeed.jsx - Public Grievance Feed with Restructured Dashboards, Priority Filters & Sorting
import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, MapPin, Grid, HelpCircle, AlertCircle } from "lucide-react";
import ComplaintCard from "./ComplaintCard";
import { districtNames } from "../utils/seedData";
import { getAdminInfoFromRole } from "../utils/storage";

export default function ComplaintFeed({ complaints, onComplaintClick, onUpvote, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date | upvotes
  const [citizenTab, setCitizenTab] = useState("my"); // my | community
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // Compute filtered & sorted complaints dynamically
  const filteredAndSortedComplaints = useMemo(() => {
    // 1. Filter
    let result = complaints.filter((c) => {
      const matchesSearch = 
        (c.titleEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.titleMl || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.descEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.descMl || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.citizen || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDistrict = selectedDistrict === "all" || c.district === selectedDistrict;
      const matchesPriority = selectedPriority === "all" || c.seriousness === selectedPriority;
      const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;

      return matchesSearch && matchesDistrict && matchesPriority && matchesStatus;
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === "upvotes") {
        return (b.upvotes || 0) - (a.upvotes || 0);
      } else {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });

    return result;
  }, [complaints, searchTerm, selectedStatus, selectedDistrict, selectedPriority, sortBy]);

  // Tab Filtering for Citizens
  const isMyComplaint = (c) => {
    if (!currentUser) return false;
    return c.citizen === currentUser.name;
  };

  const displayComplaints = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "citizen" || currentUser.role === "CITIZEN") {
      if (citizenTab === "my") {
        return filteredAndSortedComplaints.filter(isMyComplaint);
      } else {
        return filteredAndSortedComplaints.filter((c) => !isMyComplaint(c));
      }
    }
    return filteredAndSortedComplaints;
  }, [filteredAndSortedComplaints, currentUser, citizenTab]);

  const myComplaintsCount = useMemo(() => {
    return filteredAndSortedComplaints.filter(isMyComplaint).length;
  }, [filteredAndSortedComplaints, currentUser]);

  const communityComplaintsCount = useMemo(() => {
    return filteredAndSortedComplaints.filter((c) => !isMyComplaint(c)).length;
  }, [filteredAndSortedComplaints, currentUser]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedDistrict("all");
    setSelectedPriority("all");
    setSortBy("date");
  };

  const adminInfo = currentUser ? getAdminInfoFromRole(currentUser.role) : null;

  return (
    <div className="feed-container">
      {/* Admin Information Banner */}
      {currentUser && currentUser.role !== "citizen" && (
        <div className="admin-banner glass">
          <div className="admin-banner-info">
            <span className="admin-badge-pill">🛡️ ADMINISTRATIVE PORTAL</span>
            <h2>
              {currentUser.role === "admin" 
                ? "Super Administrator Control Panel" 
                : `${adminInfo?.level.toUpperCase()} - ${adminInfo?.department.toUpperCase()} Department Scope`}
            </h2>
            <p>
              {currentUser.role === "admin" 
                ? "You have full super-user oversight to view and manage all submitted civic issues state-wide."
                : `You are authorized to view and action grievances routed to the ${adminInfo?.department.toLowerCase()} department at the ${adminInfo?.level.toLowerCase()} level.`}
            </p>
          </div>
        </div>
      )}

      {/* Citizen Personalization Tabs */}
      {currentUser && currentUser.role === "citizen" && (
        <div className="citizen-tabs-container glass">
          <button
            onClick={() => setCitizenTab("my")}
            className={`citizen-tab-btn ${citizenTab === "my" ? "active" : ""}`}
          >
            📋 My Complaints ({myComplaintsCount})
          </button>
          <button
            onClick={() => setCitizenTab("community")}
            className={`citizen-tab-btn ${citizenTab === "community" ? "active" : ""}`}
          >
            🌍 Community Issues ({communityComplaintsCount})
          </button>
        </div>
      )}

      {/* Search & Basic Filters Board */}
      <div className="feed-filter-board glass">
        <div className="filter-main-row">
          <div className="search-bar-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by keywords, location coordinates, Malayalam, or citizen names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-selector-box">
            <label htmlFor="feed-sort-select">Sort by</label>
            <select
              id="feed-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Newest Submission</option>
              <option value="upvotes">Most Upvotes</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowAdvanceFilters(!showAdvanceFilters)} 
            className={`btn-toggle-filters ${showAdvanceFilters ? "active" : ""}`}
            title="Toggle Advanced District Filters"
          >
            <SlidersHorizontal size={16} />
            <span>District</span>
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvanceFilters && (
          <div className="advanced-filters-panel animate-fade-in">
            <div className="filter-group">
              <label htmlFor="district-select">Filter by Kerala District</label>
              <select 
                id="district-select"
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="all">All Kerala Districts (സംസ്ഥാനം മുഴുവൻ)</option>
                {Object.entries(districtNames).map(([code, names]) => (
                  <option key={code} value={code}>
                    {names.nameEn} ({names.nameMl})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Horizontal Priority Navigation Tabs */}
        <div className="priority-tabs-row">
          {[
            { id: "all", label: "All Priorities" },
            { id: "low", label: "Low" },
            { id: "medium", label: "Medium" },
            { id: "high", label: "High" },
            { id: "critical", label: "Critical" }
          ].map((p) => {
            const isActive = selectedPriority === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPriority(p.id)}
                className={`priority-tab-btn ${isActive ? "active" : ""}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Status Chips */}
        <div className="status-scroll-container">
          <div className="status-scroll-inner">
            {[
              { id: "all", label: "All Statuses", emoji: "📋" },
              { id: "submitted", label: "Submitted", emoji: "📥" },
              { id: "reviewed", label: "Reviewed", emoji: "👀" },
              { id: "scheduled", label: "Scheduled", emoji: "📅" },
              { id: "inprogress", label: "In Progress", emoji: "🛠️" },
              { id: "resolved", label: "Resolved", emoji: "✅" }
            ].map((st) => {
              const isActive = selectedStatus === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`status-chip-btn ${isActive ? "active" : ""}`}
                >
                  <span className="chip-emoji">{st.emoji}</span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed statistics and quick reset action */}
      <div className="feed-meta-summary">
        <p className="results-count">
          Showing <strong>{displayComplaints.length}</strong> {displayComplaints.length === 1 ? "grievance" : "grievances"} in total
        </p>
        {(searchTerm || selectedStatus !== "all" || selectedDistrict !== "all" || selectedPriority !== "all") && (
          <button onClick={handleResetFilters} className="btn-reset-filters">
            Clear all filters
          </button>
        )}
      </div>

      {/* Complaints Grid Layout */}
      {displayComplaints.length > 0 ? (
        <div className="feed-grid">
          {displayComplaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onClick={onComplaintClick}
              onUpvote={onUpvote}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <div className="empty-feed-card glass animate-fade-in">
          <AlertCircle size={48} color="var(--text-muted)" />
          <h3>No Public Grievances Found</h3>
          <p>We couldn't find any filed grievances matching your active tab, category, or search filters.</p>
          <button onClick={handleResetFilters} className="btn-empty-reset pulse-glow">
            Reset Active Filters
          </button>
        </div>
      )}

      <style>{`
        .feed-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-banner {
          display: flex;
          align-items: center;
          padding: 24px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          margin-bottom: 8px;
        }

        .admin-banner-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .admin-badge-pill {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          width: max-content;
          border: 1px solid rgba(99, 102, 241, 0.3);
          letter-spacing: 0.05em;
        }

        .admin-banner-info h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .admin-banner-info p {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .citizen-tabs-container {
          display: flex;
          gap: 12px;
          padding: 6px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          margin-bottom: 8px;
        }

        .citizen-tab-btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .citizen-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .citizen-tab-btn.active {
          color: white;
          background: var(--accent-color);
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .feed-filter-board {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .filter-main-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-bar-box {
          flex: 1;
          height: 42px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 10px;
        }

        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-bar-box input {
          width: 100%;
          height: 100%;
          font-size: 13.5px;
          color: var(--text-primary);
          outline: none;
        }

        .sort-selector-box {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .sort-selector-box label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sort-select {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          height: 42px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .sort-select:focus {
          border-color: var(--accent-color);
        }

        .btn-toggle-filters {
          height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-toggle-filters:hover {
          border-color: var(--text-muted);
          background: var(--bg-input);
        }

        .btn-toggle-filters.active {
          color: white;
          background: var(--accent-color);
          border-color: var(--accent-color);
        }

        .advanced-filters-panel {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 12px;
          border: 1px dashed var(--border-color);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-align: left;
        }

        .filter-group select {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12.5px;
        }

        .priority-tabs-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
          border-bottom: 1px solid var(--border-color);
        }

        .priority-tab-btn {
          padding: 8px 16px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .priority-tab-btn:hover {
          color: var(--text-primary);
        }

        .priority-tab-btn.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }

        .status-scroll-container {
          width: 100%;
          overflow-x: auto;
        }

        .status-scroll-inner {
          display: flex;
          gap: 8px;
          padding: 2px 0;
        }

        .status-chip-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .status-chip-btn:hover {
          background: var(--bg-input);
          border-color: var(--text-muted);
          color: var(--text-primary);
        }

        .status-chip-btn.active {
          color: white;
          background: var(--accent-color);
          border-color: var(--accent-color);
          box-shadow: 0 4px 10px var(--accent-glow);
        }

        .feed-meta-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .results-count {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .btn-reset-filters {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-color);
          cursor: pointer;
        }

        .btn-reset-filters:hover {
          text-decoration: underline;
        }

        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .empty-feed-card {
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          background: var(--bg-secondary);
        }

        .empty-feed-card h3 {
          font-size: 18px;
          color: var(--text-primary);
        }

        .empty-feed-card p {
          font-size: 13px;
          color: var(--text-secondary);
          max-width: 360px;
          line-height: 1.5;
        }

        .btn-empty-reset {
          background: var(--accent-color);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .btn-empty-reset:hover {
          background: var(--accent-hover);
        }

        @media (max-width: 768px) {
          .feed-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
