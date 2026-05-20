// Leaderboard.jsx - Dynamic Kerala District Grievance Resolution Leaderboard
import React, { useMemo } from "react";
import { Trophy, Shield, ArrowUp, ArrowDown, Award, TrendingUp } from "lucide-react";
import { districtNames } from "../utils/seedData";

// Baseline rates to seed realistic values for all 14 districts in Kerala
const BASE_DISTRICT_DATA = {
  MPM: { baseResolved: 145, baseTotal: 198 },
  EKM: { baseResolved: 212, baseTotal: 254 },
  TVM: { baseResolved: 189, baseTotal: 232 },
  TSR: { baseResolved: 165, baseTotal: 210 },
  KKD: { baseResolved: 154, baseTotal: 190 },
  PKD: { baseResolved: 98, baseTotal: 140 },
  KLM: { baseResolved: 87, baseTotal: 120 },
  ALP: { baseResolved: 76, baseTotal: 112 },
  KTM: { baseResolved: 92, baseTotal: 130 },
  KSD: { baseResolved: 54, baseTotal: 92 },
  KNR: { baseResolved: 110, baseTotal: 145 },
  WYD: { baseResolved: 42, baseTotal: 65 },
  IDK: { baseResolved: 35, baseTotal: 58 },
  PTA: { baseResolved: 62, baseTotal: 84 }
};

export default function Leaderboard({ complaints }) {
  const dynamicLeaderboard = useMemo(() => {
    // 1. Initialize stats with baseline counts
    const stats = {};
    Object.keys(districtNames).forEach((code) => {
      const base = BASE_DISTRICT_DATA[code] || { baseResolved: 10, baseTotal: 15 };
      stats[code] = {
        code,
        nameEn: districtNames[code].nameEn,
        nameMl: districtNames[code].nameMl,
        resolved: base.baseResolved,
        total: base.baseTotal
      };
    });

    // 2. Add dynamic complaints statistics
    complaints.forEach((c) => {
      if (stats[c.district]) {
        stats[c.district].total += 1;
        if (c.status === "resolved") {
          stats[c.district].resolved += 1;
        }
      }
    });

    // 3. Compute rate and map into array
    const list = Object.values(stats).map((d) => {
      const active = d.total - d.resolved;
      const rate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
      return {
        ...d,
        active,
        rate
      };
    });

    // 4. Sort by resolution rate (descending), then by resolved count (descending)
    return list.sort((a, b) => b.rate - a.rate || b.resolved - a.resolved);
  }, [complaints]);

  // Render rank trophy or medal
  const renderRankBadge = (rank) => {
    if (rank === 1) return <div className="rank-award gold"><Trophy size={16} /></div>;
    if (rank === 2) return <div className="rank-award silver"><Award size={16} /></div>;
    if (rank === 3) return <div className="rank-award bronze"><Shield size={16} /></div>;
    return <span className="rank-number">{rank}</span>;
  };

  return (
    <div className="leaderboard-grid">
      {/* Dynamic Summary Cards */}
      <div className="summary-cards-row">
        <div className="summary-card glass">
          <TrendingUp size={24} color="var(--color-resolved)" />
          <div className="sum-txt">
            <h4>Highest Efficiency</h4>
            <p className="sum-value">{dynamicLeaderboard[0]?.nameEn || "N/A"}</p>
            <span className="sum-sub">{dynamicLeaderboard[0]?.rate}% resolved</span>
          </div>
        </div>

        <div className="summary-card glass">
          <Trophy size={24} color="var(--color-reviewed)" />
          <div className="sum-txt">
            <h4>Top Resolved Volume</h4>
            <p className="sum-value">
              {
                [...dynamicLeaderboard].sort((a,b) => b.resolved - a.resolved)[0]?.nameEn || "N/A"
              }
            </p>
            <span className="sum-sub">
              {
                [...dynamicLeaderboard].sort((a,b) => b.resolved - a.resolved)[0]?.resolved
              } issues cleared
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="leaderboard-board glass">
        <div className="board-header">
          <h3>Kerala District Grievance Resolution Leaderboard</h3>
          <p className="board-subtitle">
            Real-time ranking of Kerala's 14 districts based on active citizen filing versus municipal resolution rates.
          </p>
        </div>

        <div className="leaderboard-list">
          {/* Table Header Row */}
          <div className="leaderboard-table-header">
            <span className="col-rank">Rank</span>
            <span className="col-district">District Name</span>
            <span className="col-rate">Resolution Rate</span>
            <span className="col-stats">Cleared / Total</span>
            <span className="col-active">Active</span>
          </div>

          {/* List Items */}
          {dynamicLeaderboard.map((item, index) => {
            const rank = index + 1;
            return (
              <div key={item.code} className={`leaderboard-item-row ${rank <= 3 ? "top-three" : ""}`}>
                <div className="col-rank">
                  {renderRankBadge(rank)}
                </div>

                <div className="col-district">
                  <div className="dist-title-box">
                    <span className="dist-en">{item.nameEn}</span>
                    <span className="dist-ml">{item.nameMl}</span>
                  </div>
                </div>

                <div className="col-rate">
                  <div className="rate-box">
                    <span className="rate-percent">{item.rate}%</span>
                    <div className="progress-bar-track">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${item.rate}%`,
                          backgroundColor: item.rate > 80 ? "var(--color-resolved)" : item.rate > 65 ? "var(--color-reviewed)" : "var(--color-seriousness-critical)"
                        }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="col-stats">
                  <span className="stats-count">{item.resolved}</span>
                  <span className="stats-total">/ {item.total}</span>
                </div>

                <div className="col-active">
                  <span className={`active-badge ${item.active > 0 ? "has-active" : ""}`}>
                    {item.active} active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .leaderboard-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .summary-cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .summary-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sum-txt {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .sum-txt h4 {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .sum-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .sum-sub {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .leaderboard-board {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .board-header h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .board-subtitle {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 4px;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .leaderboard-table-header {
          display: grid;
          grid-template-columns: 80px 1.5fr 1.2fr 1fr 100px;
          background: rgba(0, 0, 0, 0.25);
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
        }

        .leaderboard-item-row {
          display: grid;
          grid-template-columns: 80px 1.5fr 1.2fr 1fr 100px;
          padding: 14px 16px;
          align-items: center;
          font-size: 13.5px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.01);
          transition: background var(--transition-fast);
        }

        .leaderboard-item-row:last-child {
          border-bottom: none;
        }

        .leaderboard-item-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .top-three {
          background: rgba(99, 102, 241, 0.02);
        }

        /* Column Elements */
        .col-rank {
          display: flex;
          align-items: center;
        }

        .rank-award {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .rank-award.gold { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4); }
        .rank-award.silver { background: linear-gradient(135deg, #94a3b8, #64748b); box-shadow: 0 2px 8px rgba(148, 163, 184, 0.4); }
        .rank-award.bronze { background: linear-gradient(135deg, #b45309, #78350f); box-shadow: 0 2px 8px rgba(180, 83, 9, 0.4); }

        .rank-number {
          font-weight: 700;
          color: var(--text-muted);
          padding-left: 6px;
        }

        .dist-title-box {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .dist-en {
          font-weight: 700;
          color: var(--text-primary);
        }

        .dist-ml {
          font-size: 11px;
          color: var(--text-secondary);
          font-style: italic;
        }

        .rate-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rate-percent {
          font-weight: 700;
          width: 36px;
        }

        .progress-bar-track {
          flex: 1;
          height: 6px;
          background: var(--bg-input);
          border-radius: 3px;
          overflow: hidden;
          max-width: 120px;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        .stats-count {
          font-weight: 700;
          color: var(--text-primary);
        }

        .stats-total {
          color: var(--text-muted);
          font-size: 12px;
          margin-left: 2px;
        }

        .active-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(0,0,0,0.1);
        }

        .active-badge.has-active {
          color: var(--color-seriousness-medium);
          background: rgba(234, 179, 8, 0.08);
        }

        @media (max-width: 768px) {
          .summary-cards-row {
            grid-template-columns: 1fr;
          }
          
          .leaderboard-table-header {
            grid-template-columns: 50px 1fr 1fr;
          }
          
          .leaderboard-item-row {
            grid-template-columns: 50px 1fr 1fr;
          }
          
          .col-stats, .col-active, .progress-bar-track {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
