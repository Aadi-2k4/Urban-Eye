// ComplaintFeed.jsx - Public Grievance Feed with full Search, District, Urgency, Status, and Category filters
import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, MapPin, Grid, HelpCircle, AlertCircle } from "lucide-react";
import ComplaintCard from "./ComplaintCard";
import { districtNames } from "../utils/seedData";

const CATEGORIES = [
  { id: "all", label: "All Grievances", emoji: "📋" },
  { id: "pothole", label: "Road & Pothole", emoji: "🕳️" },
  { id: "waste", label: "Waste Dumping", emoji: "🗑️" },
  { id: "streetlight", label: "Streetlights", emoji: "💡" },
  { id: "waterlogging", label: "Waterlogging", emoji: "🌊" },
  { id: "property", label: "Encroachments", emoji: "🚧" },
  { id: "other", label: "Other Issues", emoji: "📌" }
];

const STATUSES = [
  { id: "all", label: "All States" },
  { id: "submitted", label: "Submitted" },
  { id: "reviewed", label: "Under Review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "inprogress", label: "In Progress" },
  { id: "resolved", label: "Resolved" }
];

export default function ComplaintFeed({ complaints, onComplaintClick, onUpvote, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // Compute filtered complaints dynamically
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch = 
        (c.titleEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.titleMl || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.descEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.descMl || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.citizen || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
      const matchesDistrict = selectedDistrict === "all" || c.district === selectedDistrict;
      const matchesUrgency = selectedUrgency === "all" || c.seriousness === selectedUrgency;

      return matchesSearch && matchesCategory && matchesStatus && matchesDistrict && matchesUrgency;
    });
  }, [complaints, searchTerm, selectedCategory, selectedStatus, selectedDistrict, selectedUrgency]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedDistrict("all");
    setSelectedUrgency("all");
  };

  return (
    <div className="feed-container">
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
          
          <button 
            onClick={() => setShowAdvanceFilters(!showAdvanceFilters)} 
            className={`btn-toggle-filters ${showAdvanceFilters ? "active" : ""}`}
            title="Toggle Advanced Grievance Filters"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
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

            <div className="filter-group">
              <label htmlFor="urgency-select">Filter by Grievance Urgency</label>
              <select 
                id="urgency-select"
                value={selectedUrgency} 
                onChange={(e) => setSelectedUrgency(e.target.value)}
              >
                <option value="all">All Urgency Levels</option>
                <option value="critical">Critical (Immediate)</option>
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
            </div>
          </div>
        )}

        {/* Horizontal Status Navigation Tabs */}
        <div className="status-tabs-row">
          {STATUSES.map((status) => {
            const isActive = selectedStatus === status.id;
            return (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`status-tab-btn ${isActive ? "active" : ""}`}
              >
                {status.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Category Chips */}
        <div className="category-scroll-container">
          <div className="category-scroll-inner">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-chip-btn ${isActive ? "active" : ""}`}
                >
                  <span className="chip-emoji">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed statistics and quick reset action */}
      <div className="feed-meta-summary">
        <p className="results-count">
          Showing <strong>{filteredComplaints.length}</strong> {filteredComplaints.length === 1 ? "grievance" : "grievances"} in total
        </p>
        {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDistrict !== "all" || selectedUrgency !== "all") && (
          <button onClick={handleResetFilters} className="btn-reset-filters">
            Clear all filters
          </button>
        )}
      </div>

      {/* Complaints Grid Layout */}
      {filteredComplaints.length > 0 ? (
        <div className="feed-grid">
          {filteredComplaints.map((c) => (
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
          <p>We couldn't find any filed grievances matching your precise active filters or search terms.</p>
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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
        }

        .filter-group select {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12.5px;
        }

        .status-tabs-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
          border-bottom: 1px solid var(--border-color);
        }

        .status-tab-btn {
          padding: 8px 16px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .status-tab-btn:hover {
          color: var(--text-primary);
        }

        .status-tab-btn.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }

        .category-scroll-container {
          width: 100%;
          overflow-x: auto;
        }

        .category-scroll-inner {
          display: flex;
          gap: 8px;
          padding: 2px 0;
        }

        .category-chip-btn {
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

        .category-chip-btn:hover {
          background: var(--bg-input);
          border-color: var(--text-muted);
          color: var(--text-primary);
        }

        .category-chip-btn.active {
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
          .advanced-filters-panel {
            grid-template-columns: 1fr;
          }
          
          .btn-toggle-filters span {
            display: none;
          }
          
          .feed-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
