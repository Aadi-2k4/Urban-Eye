// ComplaintCard.jsx - Glassmorphic complaint list card with status indicators and starvation alerts
import React from "react";
import { ThumbsUp, MessageSquare, MapPin, Calendar, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { districtNames } from "../utils/seedData";
import { isUserAdmin } from "../utils/storage";

// Helper for category translations/styling
const categoryMeta = {
  pothole: { label: "Pothole / Road", color: "#ef4444", emoji: "🕳️" },
  waste: { label: "Waste Dumping", color: "#854d0e", emoji: "🗑️" },
  streetlight: { label: "Streetlight", color: "#eab308", emoji: "💡" },
  waterlogging: { label: "Waterlogging", color: "#06b6d4", emoji: "🌊" },
  property: { label: "Encroachment", color: "#8b5cf6", emoji: "🚧" },
  other: { label: "Other issue", color: "#64748b", emoji: "📌" }
};

const statusMeta = {
  submitted: { label: "Submitted", color: "var(--color-submitted)" },
  reviewed: { label: "Reviewed", color: "var(--color-reviewed)" },
  scheduled: { label: "Scheduled", color: "var(--color-scheduled)" },
  inprogress: { label: "In Progress", color: "var(--color-inprogress)" },
  resolved: { label: "Resolved", color: "var(--color-resolved)" }
};

export default function ComplaintCard({ complaint, onClick, onUpvote, currentUser }) {
  const cat = categoryMeta[complaint.category] || categoryMeta.other;
  const stat = statusMeta[complaint.status] || statusMeta.submitted;
  const isUpgraded = complaint.seriousness !== complaint.originalSeriousness;
  const isUpvotedByMe = currentUser && complaint.upvotedBy && complaint.upvotedBy.includes(currentUser.username);

  // Format time relative
  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days} days ago`;
  };

  const handleUpvoteClick = (e) => {
    e.stopPropagation();
    onUpvote(complaint.id);
  };

  return (
    <div 
      className={`card-complaint glass ripple-hover ${complaint.seriousness === "critical" ? "critical-card-border" : ""}`}
      onClick={() => onClick(complaint)}
    >
      {/* Category Badge & Seriousness Tier */}
      <div className="card-top-badges">
        <span className="category-chip" style={{ borderColor: cat.color, color: cat.color }}>
          <span className="category-emoji">{cat.emoji}</span>
          <span>{cat.label}</span>
        </span>

        {complaint.isGroup && (
          <span className="group-badge-card" style={{
            background: "var(--accent-color)",
            color: "white",
            fontSize: "10px",
            fontWeight: "700",
            padding: "3px 8px",
            borderRadius: "20px",
            boxShadow: "0 0 8px var(--accent-glow)",
            border: "1px solid rgba(255, 255, 255, 0.15)"
          }}>
            👥 Group ({complaint.childComplaints.length})
          </span>
        )}

        <span className={`seriousness-badge ${complaint.seriousness}`}>
          {complaint.seriousness.toUpperCase()}
          {complaint.seriousness === "critical" && <span className="seriousness-pulse-critical" />}
        </span>
      </div>

      {/* Complaint Image Thumbnail */}
      {complaint.image && (
        <div className="card-thumbnail-box">
          <img src={complaint.image} alt={complaint.titleEn} className="card-thumbnail" loading="lazy" />
          <div className="card-status-overlay" style={{ background: stat.color }}>
            {stat.label}
          </div>
        </div>
      )}

      {/* Titles */}
      <div className="card-details">
        <div className="location-row">
          <MapPin size={12} color="var(--text-muted)" />
          <span className="location-txt">
            {complaint.location}, {districtNames[complaint.district]?.nameEn || complaint.district}
          </span>
        </div>

        <h4 className="title-en">{complaint.titleEn}</h4>
        {complaint.titleMl && (
          <p className="title-ml">{complaint.titleMl}</p>
        )}

        <p className="desc-en-snippet">
          {complaint.descEn.length > 95 ? `${complaint.descEn.substring(0, 95)}...` : complaint.descEn}
        </p>

        {/* Starvation Engine Promoted Alert */}
        {isUpgraded && (
          <div className="starvation-upgrade-alert animate-pulse">
            <AlertTriangle size={14} color="var(--color-seriousness-high)" />
            <span>
              Aging upgrade! Raised from <strong>{complaint.originalSeriousness}</strong> to prevent starvation.
            </span>
          </div>
        )}

        {/* E-commerce Status Simple Line */}
        <div className="card-stepper-summary">
          <div className="stepper-dots">
            {["submitted", "reviewed", "scheduled", "inprogress", "resolved"].map((s, idx) => {
              const stages = ["submitted", "reviewed", "scheduled", "inprogress", "resolved"];
              const currentIdx = stages.indexOf(complaint.status);
              const isActive = idx <= currentIdx;
              return (
                <span 
                  key={s} 
                  className={`step-dot ${isActive ? "active" : ""}`}
                  style={{ backgroundColor: isActive ? stat.color : "" }}
                  title={s.toUpperCase()}
                />
              );
            })}
          </div>
          <span className="stepper-status-text" style={{ color: stat.color }}>
            Stage: {stat.label}
          </span>
        </div>

        <div className="card-divider" />

        {/* Bottom meta stats */}
        <div className="card-footer-meta">
          <div className="user-time-meta">
            <Clock size={12} color="var(--text-muted)" />
            <span>{getRelativeTime(complaint.createdAt)}</span>
            <span className="meta-dot">•</span>
            <span>By: {isUserAdmin(currentUser) ? "[REDACTED FOR PRIVACY]" : complaint.citizen}</span>
          </div>

          <div className="action-stats">
            <button className={`upvote-action-btn ${isUpvotedByMe ? "upvoted" : ""}`} onClick={handleUpvoteClick} title="Upvote this complaint to raise civic concern">
              <ThumbsUp size={14} />
              <span>{complaint.upvotes || 0}</span>
            </button>

            <div className="comments-count-stat">
              <MessageSquare size={14} />
              <span>{complaint.comments?.length || 0}</span>
            </div>
            
            <div className="card-expand-icon">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .card-complaint {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          cursor: pointer;
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
          border: 1px solid var(--border-color);
        }

        .card-complaint:hover {
          transform: translateY(-4px);
          border-color: var(--text-muted);
          box-shadow: var(--card-shadow), 0 12px 24px -10px var(--accent-glow);
        }

        .critical-card-border {
          border-color: rgba(239, 68, 68, 0.4) !important;
        }

        .critical-card-border:hover {
          border-color: var(--color-seriousness-critical) !important;
          box-shadow: var(--card-shadow), 0 12px 24px -10px rgba(239, 68, 68, 0.15) !important;
        }

        .card-top-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
          pointer-events: none;
        }

        .category-chip {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid transparent;
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .category-emoji {
          font-size: 12px;
        }

        .seriousness-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.03em;
          color: white;
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .seriousness-badge.low { background: var(--color-seriousness-low); }
        .seriousness-badge.medium { background: var(--color-seriousness-medium); color: #000; }
        .seriousness-badge.high { background: var(--color-seriousness-high); }
        .seriousness-badge.critical { background: var(--color-seriousness-critical); }

        .card-thumbnail-box {
          position: relative;
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: #0d1326;
        }

        .card-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .card-complaint:hover .card-thumbnail {
          transform: scale(1.05);
        }

        .card-status-overlay {
          position: absolute;
          bottom: 12px;
          right: 12px;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .card-details {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .location-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .location-txt {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .title-en {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
          margin-bottom: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .title-ml {
          font-size: 12.5px;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.3;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .desc-en-snippet {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.45;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .starvation-upgrade-alert {
          background: rgba(234, 179, 8, 0.08);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 10.5px;
          color: var(--color-seriousness-medium);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }

        [data-theme="dark"] .starvation-upgrade-alert {
          background: rgba(234, 179, 8, 0.05);
        }

        .card-stepper-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          margin-bottom: 12px;
        }

        .stepper-dots {
          display: flex;
          gap: 4px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border-color);
        }

        .stepper-status-text {
          font-size: 10px;
          font-weight: 700;
        }

        .card-divider {
          height: 1px;
          background: var(--border-color);
          margin-bottom: 12px;
        }

        .card-footer-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-time-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          color: var(--text-muted);
        }

        .meta-dot {
          font-weight: bold;
        }

        .action-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upvote-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .upvote-action-btn:hover {
          color: var(--accent-color);
          border-color: var(--accent-color);
          background: var(--accent-glow);
        }

        .upvote-action-btn.upvoted {
          color: #f59e0b;
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .upvote-action-btn.upvoted:hover {
          background: rgba(245, 158, 11, 0.15);
        }

        .comments-count-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .card-expand-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: color var(--transition-fast), transform var(--transition-fast);
        }

        .card-complaint:hover .card-expand-icon {
          color: var(--accent-color);
          transform: translate(1px, -1px);
        }
      `}</style>
    </div>
  );
}
