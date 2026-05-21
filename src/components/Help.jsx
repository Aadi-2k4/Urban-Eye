// Help.jsx - User Manual & Platform Documentation Portal for Citizens & Administrators
import React, { useState } from "react";
import { 
  User, 
  ShieldCheck, 
  BookOpen, 
  HelpCircle, 
  Megaphone, 
  Sparkles, 
  Smartphone, 
  ThumbsUp, 
  Sliders, 
  Route, 
  Hourglass, 
  TrendingUp,
  MapPin,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function Help({ currentUser }) {
  // If user is admin, default to admin guide. If citizen/guest, default to citizen guide.
  const isAdmin = currentUser && currentUser.role !== "citizen";
  const [activeGuide, setActiveGuide] = useState(isAdmin ? "admin" : "citizen");

  return (
    <div className="help-viewport animate-fade-in">
      {/* Intro Panel */}
      <div className="help-hero-banner glass">
        <div className="hero-icon-box">
          <BookOpen size={24} color="white" />
        </div>
        <div className="hero-text-box">
          <span className="badge-pill">📖 COMPREHENSIVE USER MANUAL</span>
          <h1>How UrbanEye Works</h1>
          <p>
            Welcome to the UrbanEye Smart Grievance Portal. Follow the instructions below to learn how citizens report issues and how administrators handle, schedule, and resolve civic complaints using our smart dispatch optimizer.
          </p>
        </div>
      </div>

      {/* Guide Toggles */}
      <div className="help-tabs-container glass">
        <button
          onClick={() => setActiveGuide("citizen")}
          className={`help-tab-btn ${activeGuide === "citizen" ? "active" : ""}`}
        >
          <User size={16} />
          <span>Citizen Portal Guide</span>
        </button>
        <button
          onClick={() => setActiveGuide("admin")}
          className={`help-tab-btn ${activeGuide === "admin" ? "active" : ""}`}
        >
          <ShieldCheck size={16} />
          <span>Administrator Manual</span>
        </button>
      </div>

      {/* Guide Content Window */}
      <div className="help-content-window">
        {activeGuide === "citizen" ? (
          <div className="guide-layout animate-fade-in">
            {/* Step-by-Step reporting flow cards */}
            <h2 className="section-title">Citizen Grievance Submission Flow</h2>
            <div className="steps-grid">
              
              <div className="step-card glass">
                <div className="step-num-badge">1</div>
                <div className="step-icon-box authentication">
                  <Smartphone size={20} />
                </div>
                <h3>Identity Verification</h3>
                <p>
                  To eliminate spam and anonymous fake reports, citizens must log in with their credentials or verify their identity. 
                </p>
                <div className="step-detail-box">
                  <strong>How-To:</strong> Log in as a citizen using guest credentials (<code>citizen</code> / <code>123</code>), or sign up for a new account. Alternatively, use the **Secure WhatsApp Bot** tab in the reporting modal to simulate an OTP verification flow.
                </div>
              </div>

              <div className="step-card glass">
                <div className="step-num-badge">2</div>
                <div className="step-icon-box reporting">
                  <Megaphone size={20} />
                </div>
                <h3>File Grievance details</h3>
                <p>
                  Fill out key information about the civic issue. Choose a category (Pothole, Waste, Streetlight, Waterlogging, Encroachment, or Other).
                </p>
                <div className="step-detail-box">
                  <strong>How-To:</strong> Enter an English Title and Description. Use the ✨ **Auto-Translate** buttons to automatically translate your custom details into Malayalam.
                </div>
              </div>

              <div className="step-card glass">
                <div className="step-num-badge">3</div>
                <div className="step-icon-box mapping">
                  <MapPin size={20} />
                </div>
                <h3>Specify Map Location</h3>
                <p>
                  Specify the district and local landmark. Anchor the exact coordinates to ensure dispatch crews can find the issue.
                </p>
                <div className="step-detail-box">
                  <strong>How-To:</strong> Select your local district from the dropdown. Click the **"Fetch GPS"** button to simulate current coordinates or click directly on the interactive map to fine-tune the target marker position.
                </div>
              </div>

              <div className="step-card glass">
                <div className="step-num-badge">4</div>
                <div className="step-icon-box media">
                  <Sparkles size={20} />
                </div>
                <h3>Attach Photo Evidence</h3>
                <p>
                  Provide visual evidence. You can choose from preloaded photographic templates for the category or upload your own files.
                </p>
                <div className="step-detail-box">
                  <strong>How-To:</strong> Click on a preseeded thumbnail, or drag and drop a custom photo into the upload zone (converted to secure local base64 strings). Review the summary panel and click **Submit Grievance**.
                </div>
              </div>
            </div>

            {/* Other key features */}
            <h2 className="section-title" style={{ marginTop: "24px" }}>Platform Interactions & Feed Control</h2>
            <div className="features-grid">
              
              <div className="feature-card glass">
                <div className="feat-header">
                  <ThumbsUp size={16} color="var(--color-reviewed)" />
                  <h4>Anti-Spam Community Upvoting</h4>
                </div>
                <p>
                  Citizens can upvote other public complaints in the community feed to raise their priority. To prevent duplicate concern spikes, upvotes are restricted to **exactly one vote per ticket**. Upvoted complaints will be highlighted with a distinctive amber-gold glow (`#f59e0b`).
                </p>
              </div>

              <div className="feature-card glass">
                <div className="feat-header">
                  <BookOpen size={16} color="var(--accent-color)" />
                  <h4>My Complaints vs Community Issues</h4>
                </div>
                <p>
                  Keep track of your submissions easily! In the feed, citizens are provided with personalized tabs: **My Complaints** filters and shows only tickets submitted by your account, while **Community Issues** displays other citizens' reports.
                </p>
              </div>

              <div className="feature-card glass">
                <div className="feat-header">
                  <CheckCircle size={16} color="var(--color-resolved)" />
                  <h4>Tracking Ticket Progress</h4>
                </div>
                <p>
                  Every complaint displays an interactive 5-stage status stepper: **Submitted** (📥) ➡️ **Reviewed** (👀) ➡️ **Scheduled** (📅) ➡️ **In Progress** (🛠️) ➡️ **Resolved** (✅). You can click on any card to view detailed timelines, technician details, and resolution proofs.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="guide-layout animate-fade-in">
            {/* Admin permissions and features */}
            <h2 className="section-title">Administrative Scoped Jurisdictions</h2>
            <div className="intro-info-panel glass">
              <AlertTriangle size={20} color="var(--color-seriousness-medium)" />
              <div>
                <h4>Multi-Level Scoped Access</h4>
                <p style={{ marginTop: "4px", fontSize: "13px", lineHeight: "1.5", color: "var(--text-secondary)" }}>
                  Administrative accounts are automatically scoped by authority level (**Panchayath**, **District**, **State**) and sector department (**Road**, **Water**, **Health**, **Waste**, **Electricity**, **Other**). The platform automatically filters feeds, maps, and insights charts to show only tickets within your jurisdiction. Super Admins (<code>admin</code> / <code>admin</code>) bypass all scopes.
                </p>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: "24px" }}>Core Administrator Workflows</h2>
            <div className="steps-grid">
              
              <div className="step-card glass">
                <div className="step-num-badge">1</div>
                <div className="step-icon-box review">
                  <Sliders size={20} />
                </div>
                <h3>Review & Scope Checks</h3>
                <p>
                  Grievances start as "Submitted" and must be reviewed. Admins check details and coordinate action plans.
                </p>
                <div className="step-detail-box">
                  <strong>Action:</strong> Click on any active complaint card in your feed. Review the location coordinates, Malayalam/English titles, and media attachment. Set status to **Reviewed**.
                </div>
              </div>

              <div className="step-card glass">
                <div className="step-num-badge">2</div>
                <div className="step-icon-box schedule">
                  <Route size={20} />
                </div>
                <h3>Atomic Route Optimization</h3>
                <p>
                  When scheduling a primary unresolved High/Critical ticket, the system automatically checks for other unresolved minor issues in the **same geographical district** (within 300 meters).
                </p>
                <div className="step-detail-box">
                  <strong>Action:</strong> Change ticket status to **Scheduled**. If adjacent issues are found, they are automatically batched into a unified route. Assign a dispatch team and technician details.
                </div>
              </div>

              <div className="step-card glass">
                <div className="step-num-badge">3</div>
                <div className="step-icon-box resolve">
                  <CheckCircle size={20} />
                </div>
                <h3>Finalizing Resolutions</h3>
                <p>
                  Once the technician coordinates the physical fix, the admin files final notes and attaches visual proof of the resolved state.
                </p>
                <div className="step-detail-box">
                  <strong>Action:</strong> Set status to **Resolved**. Provide text details of the action taken and upload the resolution image proof. The ticket updates to a frozen state on the live feed.
                </div>
              </div>
            </div>

            {/* Admin-only back-end engines */}
            <h2 className="section-title" style={{ marginTop: "24px" }}>System Engines & Analytics</h2>
            <div className="features-grid">
              
              <div className="feature-card glass">
                <div className="feat-header">
                  <Hourglass size={16} color="var(--color-seriousness-critical)" />
                  <h4>Starvation Prevention & Aging Engine</h4>
                </div>
                <p>
                  To prevent low-priority tickets from sitting in queues indefinitely, unresolved issues automatically age. Every **7 simulated days**, priority increases by one level (**Low ➡️ Medium ➡️ High ➡️ Critical**). 
                </p>
              </div>

              <div className="feature-card glass">
                <div className="feat-header">
                  <ShieldCheck size={16} color="var(--accent-color)" />
                  <h4>Autonomous Escalation Gates</h4>
                </div>
                <p>
                  If tickets remain unresolved across local jurisdictions, they bypass local authorities and escalate upwards: tickets exceeding **5 days** escalate from **Panchayath** to **District**, and tickets exceeding **10 days** escalate to **State** level.
                </p>
              </div>

              <div className="feature-card glass">
                <div className="feat-header">
                  <TrendingUp size={16} color="var(--color-inprogress)" />
                  <h4>Time Machine Simulator & Analytics</h4>
                </div>
                <p>
                  Evaluators can test the starvation engine using the **"Age +7 Days"** header button. Return to baseline using **"Reset Warp"**. Super Admins can click **Insights** to view handwritten responsive SVG Bar Charts (issues by category) and circular Radial Segment Donut Charts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .help-viewport {
          max-width: 960px;
          margin: 0 auto;
          padding: 8px 0 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .help-hero-banner {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 32px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .hero-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px var(--accent-glow);
          flex-shrink: 0;
        }

        .hero-text-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hero-text-box h1 {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hero-text-box p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .help-tabs-container {
          display: flex;
          gap: 12px;
          padding: 6px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .help-tab-btn {
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

        .help-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .help-tab-btn.active {
          color: white;
          background: var(--accent-color);
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .help-content-window {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
          border-left: 3px solid var(--accent-color);
          padding-left: 10px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .step-card {
          position: relative;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .step-num-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 48px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.03);
          font-family: var(--font-heading);
          user-select: none;
        }

        .step-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        .step-icon-box.authentication {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
        }

        .step-icon-box.reporting {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        .step-icon-box.mapping {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .step-icon-box.media {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .step-icon-box.review {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
        }

        .step-icon-box.schedule {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
        }

        .step-icon-box.resolve {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .step-card h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .step-card p {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .step-detail-box {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.4;
          background: rgba(0, 0, 0, 0.15);
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          margin-top: auto;
        }

        .step-detail-box code {
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 4px;
          border-radius: 3px;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .feature-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feat-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feat-header h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .feature-card p {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .intro-info-panel {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(234, 179, 8, 0.05);
          border: 1px dashed rgba(234, 179, 8, 0.25);
          border-radius: 12px;
          align-items: flex-start;
        }

        .intro-info-panel h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .help-hero-banner {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px;
            gap: 16px;
          }
          
          .steps-grid, .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
