// ComplaintDetails.jsx - Grievance Detail Panel with E-Commerce Stepper, Comments, and Admin Schedule Batching
import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  X, ThumbsUp, MessageSquare, MapPin, Calendar, Clock, User, 
  Send, ShieldAlert, CheckCircle, Truck, Eye, PenTool, Sparkles, Map as MapIcon, Route
} from "lucide-react";
import { districtNames } from "../utils/seedData";
import { getAdminInfoFromRole, isUserAdmin, canManageComplaint, isLevelMatch } from "../utils/storage";

// Fix Leaflet marker icon asset issue in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Stepper Stages configuration
const STAGES = [
  { id: "submitted", label: "Grievance Filed", icon: PenTool, desc: "Awaiting administrative review" },
  { id: "reviewed", label: "Under Review", icon: Eye, desc: "Officials verifying the report" },
  { id: "scheduled", label: "Scheduled", icon: Calendar, desc: "Date set for field technician tour" },
  { id: "inprogress", label: "In Progress", icon: Truck, desc: "Active maintenance on-site" },
  { id: "resolved", label: "Resolved", icon: CheckCircle, desc: "Resolved by local administration" }
];

export default function ComplaintDetails({ 
  complaint, 
  onClose, 
  currentUser, 
  allComplaints, 
  onUpdateComplaint, 
  onUpvote 
}) {
  const [newComment, setNewComment] = useState("");
  const [statusVal, setStatusVal] = useState(complaint.status);
  const [hierarchyVal, setHierarchyVal] = useState(complaint.hierarchyLevel || "panchayath");
  const [departmentVal, setDepartmentVal] = useState(complaint.category);
  const [escalationReason, setEscalationReason] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionImg, setResolutionImg] = useState("https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80"); // Preset resolved image
  const [coLocSelected, setCoLocSelected] = useState({}); // Stores check states for nearby complaints
  const [activeAdminAction, setActiveAdminAction] = useState(false);

  const isUpvotedByMe = currentUser && complaint.upvotedBy && complaint.upvotedBy.includes(currentUser.username);

  const getDisplayCommenter = (userName) => {
    if (!isUserAdmin(currentUser)) return userName;
    if (!userName) return "[REDACTED FOR PRIVACY]";
    const nameUpper = userName.toUpperCase();
    const isAdmin = nameUpper.includes("ADMIN") || nameUpper.includes("SYSTEM") || nameUpper.includes("OFFICIAL") || nameUpper.includes("GOVERNMENT");
    return isAdmin ? userName : "[REDACTED FOR PRIVACY]";
  };

  const getDisplayLogUser = (userName) => {
    if (!isUserAdmin(currentUser)) return userName;
    if (!userName) return "[REDACTED FOR PRIVACY]";
    const nameUpper = userName.toUpperCase();
    const isAdmin = nameUpper.includes("ADMIN") || nameUpper.includes("SYSTEM") || nameUpper.includes("OFFICIAL") || nameUpper.includes("GOVERNMENT") || nameUpper === "SYSTEM AUTOMATED ESCALATION ENGINE";
    return isAdmin ? userName : "[REDACTED FOR PRIVACY]";
  };

  // Suggested offsets based on Seriousness rules
  const getSchedulingOffset = (seriousness) => {
    switch (seriousness) {
      case "critical": return 2;
      case "high": return 5;
      case "medium": return 10;
      case "low": return 15;
      default: return 7;
    }
  };

  const canAdminManage = useMemo(() => {
    return canManageComplaint(currentUser, complaint);
  }, [currentUser, complaint]);

  useEffect(() => {
    // Reset status fields when complaint changes
    setStatusVal(complaint.status);
    setHierarchyVal(complaint.hierarchyLevel || "panchayath");
    setDepartmentVal(complaint.category);
    setResolutionNotes(complaint.resolutionNotes || "");
    setResolutionImg(complaint.resolutionImage || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80");
    setEscalationReason("");
    
    // Auto calculate suggested schedule date
    const offset = getSchedulingOffset(complaint.seriousness);
    const suggested = new Date(Date.now() + offset * 24 * 3600 * 1000).toISOString().split('T')[0];
    setScheduleDate(complaint.scheduledDate || suggested);
    
    // Reset checked minor tickets
    setCoLocSelected({});
    setActiveAdminAction(false);
  }, [complaint]);

  const stagesList = ["submitted", "reviewed", "scheduled", "inprogress", "resolved"];
  const currentStageIdx = stagesList.indexOf(complaint.status);

  // Find nearby complaints in same district which are UNRESOLVED and LOW/MEDIUM priority
  const nearbyComplaints = allComplaints.filter(c => 
    c.district === complaint.district && 
    c.id !== complaint.id && 
    c.status !== "resolved" &&
    (c.seriousness === "low" || c.seriousness === "medium")
  );

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: "comment-" + Date.now(),
      user: currentUser ? currentUser.name : "Verified Citizen",
      text: newComment.trim(),
      time: "Just now"
    };

    const updated = {
      ...complaint,
      comments: [...(complaint.comments || []), newCommentObj]
    };

    onUpdateComplaint(updated);
    setNewComment("");
  };

  const handleAdminActionApply = (e) => {
    e.preventDefault();

    if ((hierarchyVal !== (complaint.hierarchyLevel || "panchayath") || departmentVal !== complaint.category) && !escalationReason.trim()) {
      alert("Please provide a reason for manual escalation or re-routing.");
      return;
    }

    const updates = [];
    const logs = [...(complaint.escalationLogs || [])];
    const timestamp = Date.now();
    const updater = currentUser ? currentUser.username : "Verified Admin";

    // Detect level change
    const levelChanged = hierarchyVal !== (complaint.hierarchyLevel || "panchayath");

    // Prepare updated complaint
    const updated = {
      ...complaint,
      status: statusVal,
      hierarchyLevel: hierarchyVal,
      originalHierarchyLevel: hierarchyVal,
      category: departmentVal,
      isManualLevel: levelChanged ? true : complaint.isManualLevel
    };

    // 1. Status change log
    if (statusVal !== complaint.status) {
      logs.push({
        timestamp,
        byUser: updater,
        details: `Status updated from ${complaint.status.toUpperCase()} to ${statusVal.toUpperCase()}.`
      });
    }

    // 2. Hierarchy level change log
    if (hierarchyVal !== (complaint.hierarchyLevel || "panchayath")) {
      logs.push({
        timestamp,
        byUser: updater,
        details: `Hierarchy level manually escalated from ${(complaint.hierarchyLevel || "panchayath").toUpperCase()} to ${hierarchyVal.toUpperCase()}.${escalationReason ? ` Reason: ${escalationReason}` : ""}`
      });
    }

    // 3. Department change log
    if (departmentVal !== complaint.category) {
      logs.push({
        timestamp,
        byUser: updater,
        details: `Department re-routed from ${complaint.category.toUpperCase()} to ${departmentVal.toUpperCase()}.${escalationReason ? ` Reason: ${escalationReason}` : ""}`
      });
    }

    // Assign final logs
    updated.escalationLogs = logs;

    if (statusVal === "scheduled") {
      updated.scheduledDate = scheduleDate;
      // Also log scheduling details
      logs.push({
        timestamp,
        byUser: updater,
        details: `Grievance scheduled for resolution on ${scheduleDate}.`
      });
      
      // Handle co-location batching
      const checkedIds = Object.keys(coLocSelected).filter(id => coLocSelected[id]);
      if (checkedIds.length > 0) {
        checkedIds.forEach(id => {
          const target = allComplaints.find(c => c.id === id);
          if (target) {
            // Also append scheduling logs to batched ticket!
            const nbLogs = [...(target.escalationLogs || [])];
            nbLogs.push({
              timestamp,
              byUser: updater,
              details: `Scheduled automatically via Route Optimizer with main ticket #CP-${complaint.id.slice(-4)}`
            });
            updates.push({
              ...target,
              status: "scheduled",
              scheduledDate: scheduleDate,
              resolutionNotes: `Scheduled automatically via Route Optimizer with main ticket #CP-${complaint.id.slice(-4)}`,
              escalationLogs: nbLogs
            });
          }
        });
      }
    }

    if (statusVal === "resolved") {
      updated.resolvedDate = new Date().toISOString().split('T')[0];
      updated.resolutionNotes = resolutionNotes || "Resolved successfully.";
      updated.resolutionImage = resolutionImg;
      logs.push({
        timestamp,
        byUser: updater,
        details: `Grievance marked as RESOLVED. Notes: ${resolutionNotes || "Resolved successfully."}`
      });
    }

    updates.push(updated);

    const adminInfo = getAdminInfoFromRole(currentUser.role);
    const willLoseAccess = adminInfo && !(
      isLevelMatch(adminInfo.level, hierarchyVal) && 
      departmentVal === adminInfo.department
    );

    onUpdateComplaint(updates);
    setActiveAdminAction(true);
    if (willLoseAccess) {
      alert(`Grievance updated successfully! Since it is now at the ${hierarchyVal.toUpperCase()} level under the ${departmentVal.toUpperCase()} department, it has been routed out of your administrative scope, and you will no longer have access.`);
    } else {
      alert("Grievance action and updates applied successfully!");
    }
    setEscalationReason("");
    setTimeout(() => {
      setActiveAdminAction(false);
    }, 1500);
  };

  const toggleCoLocCheckbox = (id) => {
    setCoLocSelected(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal glass animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="detail-modal-header">
          <div className="header-meta-left">
            <span className={`urgency-badge ${complaint.seriousness}`}>
              {complaint.seriousness.toUpperCase()}
            </span>
            <span className="location-crumb">
              {complaint.location} • {districtNames[complaint.district]?.nameEn || complaint.district} • <span className="hierarchy-pill">{(complaint.hierarchyLevel || "panchayath").toUpperCase()} LEVEL</span>
            </span>
          </div>
          <button className="close-detail-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="detail-scroll-content">
          
          {/* Main Titles */}
          <div className="detail-title-section">
            <h2 className="title-en-heading">{complaint.titleEn}</h2>
            {complaint.titleMl && (
              <h3 className="title-ml-subheading">{complaint.titleMl}</h3>
            )}
            <div className="citizen-stamp">
              <User size={12} />
              <span>Filed by <strong>{isUserAdmin(currentUser) ? "[REDACTED FOR PRIVACY]" : complaint.citizen}</strong></span>
              <span className="stamp-dot">•</span>
              <Clock size={12} />
              <span>{new Date(complaint.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {complaint.isGroup && (
            <div className="grouped-alert-banner glass" style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid var(--accent-color)",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={18} color="var(--accent-color)" />
                <strong style={{ fontSize: "14px", color: "var(--accent-color)" }}>
                  Grouped Issue (Contains {complaint.childComplaints.length} duplicate citizen reports)
                </strong>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
                These complaints have the same category, similar descriptions, and are located within 300 meters of each other. 
                Any resolution actions taken here will automatically propagate and apply to all child issues.
              </p>
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Submissions in this group:
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                  {complaint.childComplaints.map((child, index) => (
                    <div key={child.id} style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "1px solid var(--border-color)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <strong>Report #{index + 1} (Ref: {child.id})</strong>
                        <span style={{ color: "var(--text-muted)" }}>Upvotes: {child.upvotes || 0}</span>
                      </div>
                      <p style={{ margin: 0, opacity: 0.8 }}>"{child.descEn}"</p>
                      <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                        Filed by: {isUserAdmin(currentUser) ? "[REDACTED FOR PRIVACY]" : child.citizen} on {new Date(child.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stepper (E-commerce Style Status Tracking) */}
          <div className="stepper-section glass">
            <div className="stepper-bar-container">
              {STAGES.map((st, idx) => {
                const Icon = st.icon;
                const isActive = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                
                return (
                  <div key={st.id} className={`stepper-node ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                    <div className="stepper-circle" style={{ borderColor: isActive ? `var(--color-${complaint.status})` : "" }}>
                      <Icon size={18} />
                    </div>
                    <span className="stepper-label">{st.label}</span>
                    <span className="stepper-node-desc">{st.desc}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Resolution Display if Completed */}
            {complaint.status === "resolved" && (
              <div className="resolution-certificate-display glass">
                <div className="cert-header">
                  <CheckCircle size={20} color="var(--color-resolved)" />
                  <h4>Official Resolution Certificate</h4>
                </div>
                <p className="cert-notes">"{complaint.resolutionNotes}"</p>
                {complaint.resolutionImage && (
                  <img src={complaint.resolutionImage} alt="Verification of completion" className="cert-img" />
                )}
                <div className="cert-date">Resolved on: {complaint.resolvedDate}</div>
              </div>
            )}

            {/* Scheduled Date Display */}
            {complaint.status === "scheduled" && complaint.scheduledDate && (
              <div className="schedule-alert-banner">
                <Calendar size={16} />
                <span>Officially scheduled for resolution on <strong>{complaint.scheduledDate}</strong></span>
              </div>
            )}
          </div>

          {/* Escalation & Status History Logs */}
          {complaint.escalationLogs && complaint.escalationLogs.length > 0 && (
            <div className="escalation-logs-section glass">
              <div className="logs-header">
                <Route size={16} color="var(--accent-color)" />
                <h4>Escalation & Routing History Log</h4>
              </div>
              <div className="logs-timeline">
                {complaint.escalationLogs.map((log, idx) => (
                  <div key={idx} className="log-timeline-item">
                    <div className="log-timeline-badge" />
                    <div className="log-timeline-content">
                      <div className="log-timeline-meta">
                        <span className="log-user">👤 {getDisplayLogUser(log.byUser)}</span>
                        <span className="log-time">🕒 {new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="log-text">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Grievance Content & Interactive Map Grid */}
          <div className="detail-body-grid">
            <div className="body-left-grievance">
              {/* Description */}
              <div className="grievance-text-box">
                <h4>Description (English)</h4>
                <p className="desc-txt">{complaint.descEn}</p>
                
                {complaint.descMl && (
                  <>
                    <h4 style={{ marginTop: "16px" }}>Malayalam Description (തർജ്ജമ)</h4>
                    <p className="desc-txt-ml">{complaint.descMl}</p>
                  </>
                )}
              </div>

              {/* Main Image Attachment */}
              {complaint.image && (
                <div className="grievance-image-frame glass">
                  <img src={complaint.image} alt="Grievance Evidence" />
                </div>
              )}
            </div>

            <div className="body-right-visuals">
              {/* Geo Location Map */}
              <div className="details-map-card glass">
                <div className="map-card-header">
                  <MapIcon size={14} />
                  <span>GPS Coordinates: {complaint.lat.toFixed(6)}, {complaint.lng.toFixed(6)}</span>
                </div>
                <div className="map-view-wrapper">
                  <MapContainer 
                    center={[complaint.lat, complaint.lng]} 
                    zoom={14} 
                    scrollWheelZoom={false}
                    className="leaflet-details-map"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[complaint.lat, complaint.lng]} icon={customIcon} />
                  </MapContainer>
                </div>
              </div>

              {/* Upvoting Box */}
              <div className="upvote-card glass">
                <div className="upvote-card-content">
                  <h4>Civic Urgency Meter</h4>
                  <p>Upvote if you are facing this issue to escalate prioritization ranks.</p>
                </div>
                <button className={`btn-details-upvote pulse-glow ${isUpvotedByMe ? "upvoted" : ""}`} onClick={() => onUpvote(complaint.id)}>
                  <ThumbsUp size={16} />
                  <span>{isUpvotedByMe ? "Upvoted Grievance" : "Upvote grievance"} ({complaint.upvotes || 0})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grievance Administration Panel (Authorized Admins Only) */}
          {canAdminManage && (
            <div className="admin-control-panel glass">
              <div className="admin-panel-header">
                <ShieldAlert size={20} color="var(--accent-color)" />
                <h3>Grievance Administration Desk</h3>
                <span className="admin-pill">ADMIN PANEL</span>
              </div>
              <p className="admin-instruction">
                Schedule maintenance, manually escalate hierarchy level, re-route department, or batch optimize routes.
              </p>

              <form onSubmit={handleAdminActionApply} className="admin-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Set Grievance Lifecycle Stage</label>
                    <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)}>
                      <option value="submitted">1. Grievance Filed</option>
                      <option value="reviewed">2. Under Active Review</option>
                      <option value="scheduled">3. Scheduled for Tour</option>
                      <option value="inprogress">4. Maintenance In Progress</option>
                      <option value="resolved">5. Mark Resolved</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Hierarchy Governance Level</label>
                    <select value={hierarchyVal} onChange={(e) => setHierarchyVal(e.target.value)}>
                      <option value="panchayath">Panchayath Level</option>
                      <option value="district">District Level</option>
                      <option value="state">State Level</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Department / Category Routing</label>
                    <select value={departmentVal} onChange={(e) => setDepartmentVal(e.target.value)}>
                      <option value="pothole">Road & Pothole Damage</option>
                      <option value="waste">Public Waste & Litter</option>
                      <option value="streetlight">Broken Streetlights</option>
                      <option value="waterlogging">Waterlogging & Drainage</option>
                      <option value="property">Obstructions & Encroachment</option>
                      <option value="other">Other Grievances</option>
                    </select>
                  </div>

                  {statusVal === "scheduled" && (
                    <div className="form-group animate-fade-in">
                      <label>Suggested Resolution Date (Seriousness suggestions applied)</label>
                      <input 
                        type="date" 
                        required
                        value={scheduleDate} 
                        onChange={(e) => setScheduleDate(e.target.value)} 
                      />
                    </div>
                  )}
                </div>

                {(hierarchyVal !== (complaint.hierarchyLevel || "panchayath") || departmentVal !== complaint.category) && (
                  <div className="form-group animate-fade-in">
                    <label>Reason for Level Change / Re-routing *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Escalating for higher support / degrading to local panchayath / wrong department"
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                    />
                  </div>
                )}

                {/* Co-Location Optimizer suggestions */}
                {statusVal === "scheduled" && nearbyComplaints.length > 0 && (
                  <div className="route-optimizer-box glass animate-fade-in">
                    <div className="opt-title-bar">
                      <Route size={16} color="var(--accent-color)" />
                      <h4>Smart Co-Location Route Optimizer</h4>
                      <span className="opt-green-tag">BATCH SUGGESTION</span>
                    </div>
                    <p className="opt-desc">
                      Field technician is visiting <strong>{districtNames[complaint.district]?.nameEn}</strong> on <strong>{scheduleDate}</strong> to resolve this highly serious grievance. Batch assign these {nearbyComplaints.length} minor nearby issues to optimize resources?
                    </p>
                    
                    <div className="nearby-tickets-list">
                      {nearbyComplaints.map(nb => (
                        <div key={nb.id} className="nb-ticket-item" onClick={() => toggleCoLocCheckbox(nb.id)}>
                          <input 
                            type="checkbox" 
                            checked={!!coLocSelected[nb.id]} 
                            onChange={() => {}} // toggled by card click
                          />
                          <div className="nb-ticket-info">
                            <span className="nb-ticket-category">{nb.category.toUpperCase()}</span>
                            <span className="nb-ticket-title">{nb.titleEn}</span>
                            <span className="nb-ticket-location">{nb.location}</span>
                          </div>
                          <span className={`nb-ticket-urgency ${nb.seriousness}`}>
                            {nb.seriousness}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution inputs if resolved is selected */}
                {statusVal === "resolved" && (
                  <div className="resolution-certificate-inputs glass animate-fade-in">
                    <h4>Resolution Evidence Certification</h4>
                    
                    <div className="form-group">
                      <label>Resolution Notes *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detail the technical solutions performed, clean-up operations, or municipal deployments..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Resolution Photo URL (Demo placeholder loaded)</label>
                      <input 
                        type="text" 
                        required
                        value={resolutionImg}
                        onChange={(e) => setResolutionImg(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-apply-admin-action ripple-hover">
                  <Sparkles size={16} />
                  <span>
                    {activeAdminAction ? "Success: Action Applied!" : "Apply Grievance Action & Escalation"}
                  </span>
                </button>
              </form>
            </div>
          )}



          {/* Scoped Read-Only View Banner */}
          {currentUser && isUserAdmin(currentUser) && !canAdminManage && (
            <div className="admin-control-panel glass read-only-panel">
              <div className="admin-panel-header">
                <ShieldAlert size={20} color="var(--color-seriousness-high)" />
                <h3>Read-only Scoped View</h3>
                <span className="admin-pill read-only" style={{ background: "var(--color-seriousness-high)" }}>RESTRICTED</span>
              </div>
              <p className="admin-instruction">
                This grievance falls outside your assigned department category or geographic jurisdiction scope. You have read-only access to view logs and feedback.
              </p>
            </div>
          )}

          {/* Comments / Civic Feedback Thread */}
          <div className="comments-section-container glass">
            <div className="comments-header">
              <MessageSquare size={16} color="var(--accent-color)" />
              <h4>Civic Feedback Thread ({complaint.comments?.length || 0})</h4>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="comment-form">
              <input 
                type="text" 
                placeholder={currentUser ? "Write a civic update, query, or supportive comment..." : "Identity verification required to post comments..."} 
                disabled={!currentUser}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={!currentUser || !newComment.trim()} className="btn-send-comment">
                <Send size={14} />
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-thread-list">
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments.map((cm) => (
                  <div key={cm.id} className="comment-card-item">
                    <div className="comment-card-top">
                      <span className="comment-user"><User size={10} /> {getDisplayCommenter(cm.user)}</span>
                      <span className="comment-time">{cm.time}</span>
                    </div>
                    <p className="comment-text-body">{cm.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments-msg">No civic feedback has been posted yet. Be the first to start the discussion!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(5, 7, 16, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .detail-modal {
          width: 100%;
          max-width: 960px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 24px;
        }

        .detail-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .header-meta-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .urgency-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          color: white;
        }

        .urgency-badge.low { background: var(--color-seriousness-low); }
        .urgency-badge.medium { background: var(--color-seriousness-medium); color: #000; }
        .urgency-badge.high { background: var(--color-seriousness-high); }
        .urgency-badge.critical { background: var(--color-seriousness-critical); }

        .location-crumb {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .close-detail-btn {
          color: var(--text-muted);
          transition: color var(--transition-fast);
          padding: 4px;
        }

        .close-detail-btn:hover {
          color: var(--text-primary);
        }

        .detail-scroll-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-right: 4px;
        }

        .detail-title-section {
          flex-shrink: 0;
        }

        .title-en-heading {
          font-size: 22px;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 4px;
        }

        .title-ml-subheading {
          font-size: 17px;
          color: var(--text-secondary);
          font-style: italic;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .citizen-stamp {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .stamp-dot {
          font-weight: bold;
        }

        /* E-commerce Stepper Styles */
        .stepper-section {
          padding: 20px;
          background: rgba(0,0,0,0.12);
        }

        .stepper-bar-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          position: relative;
          gap: 12px;
        }

        .stepper-bar-container::before {
          content: "";
          position: absolute;
          top: 18px;
          left: 10%;
          right: 10%;
          height: 3px;
          background: var(--border-color);
          z-index: 1;
        }

        .stepper-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .stepper-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 3px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all var(--transition-normal);
        }

        .stepper-node.active .stepper-circle {
          color: white;
          background: var(--accent-color);
          border-color: var(--accent-color);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .stepper-label {
          font-size: 11px;
          font-weight: 700;
          margin-top: 8px;
          color: var(--text-muted);
        }

        .stepper-node.active .stepper-label {
          color: var(--text-primary);
        }

        .stepper-node-desc {
          font-size: 9px;
          color: var(--text-muted);
          margin-top: 2px;
          max-width: 110px;
          display: block;
        }

        .resolution-certificate-display {
          margin-top: 20px;
          background: var(--color-resolved-bg);
          border-color: var(--color-resolved);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cert-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cert-header h4 {
          font-size: 14px;
          color: var(--color-resolved);
        }

        .cert-notes {
          font-size: 12.5px;
          color: var(--text-primary);
          font-style: italic;
        }

        .cert-img {
          width: 100%;
          max-height: 180px;
          object-fit: cover;
          border-radius: 8px;
        }

        .cert-date {
          font-size: 10px;
          color: var(--text-muted);
          text-align: right;
        }

        .schedule-alert-banner {
          margin-top: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          background: var(--color-scheduled-bg);
          border: 1px solid var(--color-scheduled);
          color: var(--color-scheduled);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Detail Body Grid */
        .detail-body-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
        }

        .body-left-grievance {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .grievance-text-box {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid var(--border-color);
        }

        .grievance-text-box h4 {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .desc-txt {
          font-size: 13.5px;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .desc-txt-ml {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          font-family: var(--font-body);
        }

        .grievance-image-frame {
          border-radius: 12px;
          overflow: hidden;
          max-height: 320px;
        }

        .grievance-image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .body-right-visuals {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .details-map-card {
          overflow: hidden;
        }

        .map-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid var(--border-color);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .map-view-wrapper {
          height: 160px;
          width: 100%;
        }

        .leaflet-details-map {
          height: 100%;
          width: 100%;
        }

        .upvote-card {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(99, 102, 241, 0.04);
        }

        .upvote-card h4 {
          font-size: 13px;
          color: var(--text-primary);
        }

        .upvote-card p {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .btn-details-upvote {
          background: var(--accent-color);
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 10px var(--accent-glow);
        }

        .btn-details-upvote.upvoted {
          background: #d97706;
          box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);
        }

        /* Administration Panel */
        .admin-control-panel {
          background: rgba(99, 102, 241, 0.03);
          border-color: rgba(99, 102, 241, 0.2);
          padding: 20px;
        }

        .admin-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .admin-panel-header h3 {
          font-size: 16px;
          font-weight: 700;
        }

        .admin-pill {
          background: var(--accent-color);
          color: white;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .admin-instruction {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-form label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 4px;
          display: block;
        }

        .admin-form select, .admin-form input[type="date"], .admin-form textarea, .admin-form input[type="text"] {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
        }

        /* Co-location optimizer listing */
        .route-optimizer-box {
          padding: 16px;
          background: rgba(0,0,0,0.15);
        }

        .opt-title-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .opt-title-bar h4 {
          font-size: 13.5px;
          color: var(--accent-color);
        }

        .opt-green-tag {
          font-size: 9px;
          font-weight: 800;
          background: var(--color-resolved-bg);
          color: var(--color-resolved);
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;
        }

        .opt-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .nearby-tickets-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 160px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          padding: 8px;
        }

        .nb-ticket-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .nb-ticket-item:hover {
          border-color: var(--accent-color);
        }

        .nb-ticket-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .nb-ticket-category {
          font-size: 8px;
          font-weight: 800;
          color: var(--accent-color);
        }

        .nb-ticket-title {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .nb-ticket-location {
          font-size: 10px;
          color: var(--text-muted);
        }

        .nb-ticket-urgency {
          font-size: 9px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          color: white;
          text-transform: uppercase;
        }

        .nb-ticket-urgency.low { background: var(--color-seriousness-low); }
        .nb-ticket-urgency.medium { background: var(--color-seriousness-medium); color: #000; }

        .resolution-certificate-inputs {
          background: var(--color-resolved-bg);
          border: 1px dashed var(--color-resolved);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resolution-certificate-inputs h4 {
          font-size: 13px;
          color: var(--color-resolved);
        }

        .btn-apply-admin-action {
          width: 100%;
          background: var(--accent-color);
          color: white;
          font-weight: 600;
          font-size: 13.5px;
          padding: 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: background var(--transition-fast);
          margin-top: 8px;
        }

        .btn-apply-admin-action:hover {
          background: var(--accent-hover);
        }

        /* Comments Styles */
        .comments-section-container {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .comments-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .comments-header h4 {
          font-size: 14px;
          color: var(--text-primary);
        }

        .comment-form {
          display: flex;
          gap: 8px;
        }

        .comment-form input {
          flex: 1;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
        }

        .btn-send-comment {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: var(--accent-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .btn-send-comment:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .btn-send-comment:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .comments-thread-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
        }

        .comment-card-item {
          background: rgba(0,0,0,0.12);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
        }

        .comment-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .comment-user {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .comment-text-body {
          font-size: 12.5px;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .no-comments-msg {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          padding: 24px 0;
        }

        @media (max-width: 768px) {
          .detail-modal {
            height: 95vh;
            padding: 12px;
          }
          
          .stepper-bar-container {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .stepper-bar-container::before {
            display: none;
          }
          
          .stepper-node {
            flex-direction: row;
            text-align: left;
            gap: 12px;
          }
          
          .stepper-node-desc {
            max-width: 100%;
          }
          
          .detail-body-grid {
            grid-template-columns: 1fr;
          }
        }

        .hierarchy-pill {
          background: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 10px;
          margin-left: 6px;
        }

        .escalation-logs-section {
          padding: 20px;
          background: rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .logs-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .logs-header h4 {
          font-size: 14px;
          color: var(--text-primary);
          margin: 0;
        }

        .logs-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-left: 2px solid var(--border-color);
          padding-left: 16px;
          margin-left: 8px;
          text-align: left;
        }

        .log-timeline-item {
          position: relative;
        }

        .log-timeline-badge {
          position: absolute;
          left: -22px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-color);
          border: 2px solid var(--bg-card);
        }

        .log-timeline-content {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
        }

        .log-timeline-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .log-text {
          font-size: 12.5px;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }

        .aging-reset-box {
          padding: 16px;
          background: rgba(217, 119, 6, 0.04) !important;
          border: 1px dashed rgba(217, 119, 6, 0.3) !important;
          margin-top: 16px;
        }

        .btn-reset-aging {
          background: #d97706;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
          margin-top: 8px;
          width: 100%;
        }

        .btn-reset-aging:hover:not(:disabled) {
          background: #b45309;
        }

        .btn-reset-aging:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .read-only-panel {
          background: rgba(239, 68, 68, 0.03) !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
