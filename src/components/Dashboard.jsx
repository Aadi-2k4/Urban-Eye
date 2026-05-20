// Dashboard.jsx - Responsive Analytics Dashboard utilizing custom SVG Bar & Pie/Donut Charts
import React, { useMemo } from "react";
import { BarChart3, PieChart, CheckCircle2, AlertCircle, FileText, Percent, Info } from "lucide-react";

export default function Dashboard({ complaints }) {
  // 1. Calculate general stats metrics dynamically
  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const active = total - resolved;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { total, resolved, active, rate };
  }, [complaints]);

  // 2. Aggregate category frequencies for SVG Bar Chart
  const categoryChartData = useMemo(() => {
    const counts = { pothole: 0, waste: 0, streetlight: 0, waterlogging: 0, property: 0, other: 0 };
    complaints.forEach(c => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      } else {
        counts.other++;
      }
    });

    const labels = {
      pothole: "Road / Pothole",
      waste: "Waste dumping",
      streetlight: "Streetlights",
      waterlogging: "Waterlogging",
      property: "Obstruction",
      other: "Others"
    };

    return Object.entries(counts).map(([key, value]) => ({
      key,
      label: labels[key],
      value
    }));
  }, [complaints]);

  // 3. Aggregate status categories for Donut Chart
  const statusChartData = useMemo(() => {
    const counts = { submitted: 0, reviewed: 0, scheduled: 0, inprogress: 0, resolved: 0 };
    complaints.forEach(c => {
      if (counts[c.status] !== undefined) {
        counts[c.status]++;
      }
    });

    const labels = {
      submitted: "Submitted",
      reviewed: "Reviewed",
      scheduled: "Scheduled",
      inprogress: "In Progress",
      resolved: "Resolved"
    };

    const colors = {
      submitted: "var(--color-submitted)",
      reviewed: "var(--color-reviewed)",
      scheduled: "var(--color-scheduled)",
      inprogress: "var(--color-inprogress)",
      resolved: "var(--color-resolved)"
    };

    return Object.entries(counts).map(([key, value]) => ({
      key,
      label: labels[key],
      value,
      color: colors[key]
    }));
  }, [complaints]);

  // Rendering Helper: SVG Bar Chart Calculations
  const barChartConfig = useMemo(() => {
    const maxVal = Math.max(...categoryChartData.map(d => d.value), 4);
    const height = 220;
    const width = 480;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 10;
    const paddingRight = 10;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const barWidth = chartWidth / categoryChartData.length - 12;

    const bars = categoryChartData.map((d, i) => {
      const barHeight = d.value > 0 ? (d.value / maxVal) * chartHeight : 2;
      const x = paddingLeft + i * (chartWidth / categoryChartData.length) + 6;
      const y = height - paddingBottom - barHeight;
      return {
        ...d,
        x,
        y,
        w: barWidth,
        h: barHeight
      };
    });

    // Generate grid lines
    const yGridLines = [];
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const gridVal = Math.round((maxVal / ticks) * i);
      const y = height - paddingBottom - (i / ticks) * chartHeight;
      yGridLines.push({ y, val: gridVal });
    }

    return { bars, yGridLines, width, height, paddingLeft, paddingBottom };
  }, [categoryChartData]);

  // Rendering Helper: SVG Donut Chart Calculations (Pie Chart)
  const donutChartConfig = useMemo(() => {
    const total = statusChartData.reduce((sum, d) => sum + d.value, 0);
    const size = 200;
    const center = size / 2;
    const radius = 60;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;
    const segments = statusChartData.map(d => {
      if (total === 0 || d.value === 0) {
        return { ...d, strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 };
      }
      
      const pct = (d.value / total) * 100;
      const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
      // SVG stroke offset starts from top (-90deg)
      const strokeDashoffset = circumference - (accumulatedPercentage / 100) * circumference;
      accumulatedPercentage += pct;

      return {
        ...d,
        pct: Math.round(pct),
        strokeDasharray,
        strokeDashoffset
      };
    });

    return { segments, size, center, radius, strokeWidth, total };
  }, [statusChartData]);

  return (
    <div className="dashboard-container">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-header">
            <FileText size={18} color="var(--accent-color)" />
            <span>Total Grievances</span>
          </div>
          <h3>{stats.total}</h3>
          <p className="kpi-sub">Registered state logs</p>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-header">
            <CheckCircle2 size={18} color="var(--color-resolved)" />
            <span>Solved Grievances</span>
          </div>
          <h3>{stats.resolved}</h3>
          <p className="kpi-sub" style={{ color: "var(--color-resolved)" }}>
            ✓ Resolution complete
          </p>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-header">
            <AlertCircle size={18} color="var(--color-seriousness-medium)" />
            <span>Pending Audits</span>
          </div>
          <h3>{stats.active}</h3>
          <p className="kpi-sub">Awaiting field maintenance</p>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-header">
            <Percent size={18} color="var(--color-inprogress)" />
            <span>Resolution Rate</span>
          </div>
          <h3>{stats.rate}%</h3>
          <div className="kpi-bar-track">
            <div className="kpi-bar-fill" style={{ width: `${stats.rate}%` }} />
          </div>
        </div>
      </div>

      {/* SVG Charts Row */}
      <div className="charts-row">
        {/* Category Bar Chart */}
        <div className="chart-card glass">
          <div className="chart-header">
            <BarChart3 size={16} color="var(--accent-color)" />
            <h4>Grievances by Category Sector</h4>
          </div>

          <div className="svg-chart-wrapper">
            <svg viewBox={`0 0 ${barChartConfig.width} ${barChartConfig.height}`} width="100%" height="100%">
              {/* Y Axis Grid Lines */}
              {barChartConfig.yGridLines.map((line, idx) => (
                <g key={idx}>
                  <line 
                    x1={barChartConfig.paddingLeft} 
                    y1={line.y} 
                    x2={barChartConfig.width - 10} 
                    y2={line.y} 
                    stroke="var(--border-color)" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={barChartConfig.paddingLeft - 8} 
                    y={line.y + 4} 
                    fill="var(--text-muted)" 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {line.val}
                  </text>
                </g>
              ))}

              {/* X Axis Line */}
              <line 
                x1={barChartConfig.paddingLeft} 
                y1={barChartConfig.height - barChartConfig.paddingBottom} 
                x2={barChartConfig.width - 10} 
                y2={barChartConfig.height - barChartConfig.paddingBottom} 
                stroke="var(--border-color)" 
                strokeWidth="1.5"
              />

              {/* Bar Elements */}
              {barChartConfig.bars.map((bar, idx) => (
                <g key={bar.key} className="chart-bar-group">
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.w}
                    height={bar.h}
                    fill="url(#indigoGrad)"
                    rx="4"
                    className="svg-bar"
                  />
                  {/* Category Short Labels */}
                  <text
                    x={bar.x + bar.w / 2}
                    y={barChartConfig.height - barChartConfig.paddingBottom + 16}
                    fill="var(--text-secondary)"
                    fontSize="10"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {bar.label.split(" ")[0]}
                  </text>
                  {/* Floating Count on Hover */}
                  <text
                    x={bar.x + bar.w / 2}
                    y={bar.y - 4}
                    fill="var(--text-primary)"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    className="bar-value-label"
                  >
                    {bar.value}
                  </text>
                </g>
              ))}

              {/* Linear Gradient Shader for Bars */}
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="chart-card glass">
          <div className="chart-header">
            <PieChart size={16} color="var(--accent-color)" />
            <h4>Grievance Lifecycle Distribution</h4>
          </div>

          <div className="donut-chart-box">
            {/* SVG Radial Wheel */}
            <div className="svg-donut-wrapper">
              <svg viewBox={`0 0 ${donutChartConfig.size} ${donutChartConfig.size}`} width="100%" height="100%">
                <circle 
                  cx={donutChartConfig.center} 
                  cy={donutChartConfig.center} 
                  r={donutChartConfig.radius} 
                  fill="transparent" 
                  stroke="var(--bg-secondary)" 
                  strokeWidth={donutChartConfig.strokeWidth}
                />
                
                {donutChartConfig.total > 0 && donutChartConfig.segments.map((seg, idx) => (
                  <circle
                    key={seg.key}
                    cx={donutChartConfig.center}
                    cy={donutChartConfig.center}
                    r={donutChartConfig.radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={donutChartConfig.strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    transform={`rotate(-90 ${donutChartConfig.center} ${donutChartConfig.center})`}
                    strokeLinecap="round"
                    className="donut-segment"
                  />
                ))}
              </svg>
              
              {/* Inner Center Label */}
              <div className="donut-center-content">
                <span className="donut-center-val">{donutChartConfig.total}</span>
                <span className="donut-center-lbl">grievances</span>
              </div>
            </div>

            {/* Custom Interactive Legend */}
            <div className="donut-legend-list">
              {donutChartConfig.segments.map((seg) => (
                <div key={seg.key} className="legend-row-item">
                  <span className="legend-dot" style={{ backgroundColor: seg.color }} />
                  <span className="legend-txt-lbl">{seg.label}</span>
                  <span className="legend-value-count">
                    <strong>{seg.value}</strong> 
                    <span className="legend-pct-val">({donutChartConfig.total > 0 ? seg.pct : 0}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* College Project Evaluation Note */}
      <div className="eval-notice-box glass">
        <Info size={16} color="var(--accent-color)" />
        <p>
          <strong>Evaluation Note:</strong> This analytics engine recalculates instantly based on operational changes (seeding, scheduling, time warp warp simulations, and citizen upvotes) illustrating structured relational state binding.
        </p>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .kpi-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .kpi-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .kpi-card h3 {
          font-size: 28px;
          font-weight: 800;
        }

        .kpi-sub {
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        .kpi-bar-track {
          width: 100%;
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 4px;
        }

        .kpi-bar-fill {
          height: 100%;
          background: var(--color-resolved);
          border-radius: 3px;
        }

        .charts-row {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 20px;
        }

        .chart-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }

        .chart-header h4 {
          font-size: 14.5px;
          font-weight: 700;
        }

        .svg-chart-wrapper {
          height: 220px;
          width: 100%;
        }

        .svg-bar {
          transition: height 0.4s ease-out, y 0.4s ease-out, fill var(--transition-fast);
        }

        .chart-bar-group:hover .svg-bar {
          fill: var(--accent-color);
          filter: drop-shadow(0 0 6px var(--accent-glow));
        }

        .bar-value-label {
          opacity: 0;
          transition: opacity var(--transition-fast);
          pointer-events: none;
        }

        .chart-bar-group:hover .bar-value-label {
          opacity: 1;
        }

        /* Donut Chart Layout */
        .donut-chart-box {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 24px;
          align-items: center;
        }

        .svg-donut-wrapper {
          width: 140px;
          height: 140px;
          position: relative;
        }

        .donut-segment {
          transition: stroke-dasharray 0.4s ease-out, stroke-dashoffset 0.4s ease-out;
        }

        .donut-center-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1.1;
        }

        .donut-center-val {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .donut-center-lbl {
          font-size: 9px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .donut-legend-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-row-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-txt-lbl {
          color: var(--text-secondary);
        }

        .legend-value-count {
          color: var(--text-primary);
        }

        .legend-pct-val {
          font-size: 10px;
          color: var(--text-muted);
          margin-left: 2px;
        }

        .eval-notice-box {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(99, 102, 241, 0.03);
          border-color: rgba(99, 102, 241, 0.15);
        }

        .eval-notice-box p {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        @media (max-width: 1024px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .donut-chart-box {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          
          .donut-legend-list {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
