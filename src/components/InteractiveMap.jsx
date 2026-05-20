// InteractiveMap.jsx - Spatial GIS mapping component utilizing Leaflet.js and glowing custom CSS pins
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ThumbsUp, Calendar, Clock, ArrowRight } from "lucide-react";
import { districtNames } from "../utils/seedData";

// Define status HSL colors for custom Leaflet marker icons
const statusColors = {
  submitted: "#3b82f6", // Blue
  reviewed: "#f59e0b", // Amber
  scheduled: "#8b5cf6", // Violet
  inprogress: "#06b6d4", // Cyan
  resolved: "#10b981" // Emerald
};

// Create custom status-colored SVG markers
const createCustomPin = (status, seriousness) => {
  const color = statusColors[status] || "#3b82f6";
  const isCritical = seriousness === "critical";
  const glowClass = isCritical ? "pulse-critical-marker" : "pulse-normal-marker";
  
  const html = `
    <div class="custom-leaflet-marker">
      <div class="marker-glowing-ring ${glowClass}" style="background-color: ${color}"></div>
      <div class="marker-core-dot" style="background-color: ${color}; border-color: white;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "leaflet-custom-divicon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export default function InteractiveMap({ complaints, onComplaintClick, theme }) {
  // Center of Kerala state
  const keralaCenter = [10.35, 76.45];
  const defaultZoom = 8;

  return (
    <div className="map-view-container glass">
      {/* Map Header details */}
      <div className="map-legend-board">
        <div className="legend-title">
          <MapPin size={16} color="var(--accent-color)" />
          <span>Kerala Grievance Geographic Grid</span>
        </div>
        
        <div className="legend-pills">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="legend-pill-item">
              <span className="legend-color-dot" style={{ backgroundColor: color }} />
              <span className="legend-label">{status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="leaflet-map-frame">
        <MapContainer
          center={keralaCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          className="main-leaflet-grid-map"
        >
          {/* Tile layer with dynamic styling injected via CSS filters inside index.css for dark mode */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render markers for complaints that have lat/lng */}
          {complaints
            .filter((c) => c.lat && c.lng)
            .map((c) => (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={createCustomPin(c.status, c.seriousness)}
              >
                <Popup className="premium-map-popup">
                  <div className="map-popup-card">
                    {c.image && (
                      <img src={c.image} alt={c.titleEn} className="map-popup-image" />
                    )}
                    
                    <div className="map-popup-info">
                      <div className="popup-top-meta">
                        <span className={`popup-seriousness ${c.seriousness}`}>
                          {c.seriousness.toUpperCase()}
                        </span>
                        <span className="popup-category-label">
                          {c.category.toUpperCase()}
                        </span>
                      </div>
                      
                      <h4 className="map-popup-title">{c.titleEn}</h4>
                      {c.titleMl && (
                        <p className="map-popup-title-ml">{c.titleMl}</p>
                      )}
                      
                      <div className="map-popup-meta">
                        <span>📍 {c.location}</span>
                      </div>

                      <div className="popup-divider" />

                      <div className="popup-footer-row">
                        <span className="popup-status-badge" style={{ color: statusColors[c.status] }}>
                          ● {c.status.toUpperCase()}
                        </span>
                        
                        <button
                          className="map-popup-btn"
                          onClick={() => onComplaintClick(c)}
                        >
                          <span>Inspect Detail</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <style>{`
        .map-view-container {
          display: flex;
          flex-direction: column;
          height: 620px;
          overflow: hidden;
          padding: 16px;
        }

        .map-legend-board {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
          gap: 12px;
        }

        .legend-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14.5px;
        }

        .legend-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .legend-pill-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .leaflet-map-frame {
          flex: 1;
          margin-top: 14px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .main-leaflet-grid-map {
          width: 100%;
          height: 100%;
        }

        /* Glowing Marker Styles */
        .custom-leaflet-marker {
          position: relative;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-glowing-ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          opacity: 0.35;
        }

        .marker-core-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid white;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        @keyframes markerPulseNormal {
          0% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 0.15; }
          100% { transform: scale(0.8); opacity: 0.4; }
        }

        @keyframes markerPulseCritical {
          0% { transform: scale(0.8); opacity: 0.6; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { transform: scale(1.6); opacity: 0.1; box-shadow: 0 0 10px 4px rgba(239, 68, 68, 0.2); }
          100% { transform: scale(0.8); opacity: 0.6; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        }

        .pulse-normal-marker {
          animation: markerPulseNormal 2s infinite ease-in-out;
        }

        .pulse-critical-marker {
          animation: markerPulseCritical 1.4s infinite ease-in-out;
        }

        /* Popup customizations */
        .premium-map-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 12px;
          overflow: hidden;
        }

        .popup-top-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .popup-seriousness {
          font-size: 8.5px;
          font-weight: 800;
          color: white;
          padding: 1px 4px;
          border-radius: 4px;
        }

        .popup-seriousness.low { background: var(--color-seriousness-low); }
        .popup-seriousness.medium { background: var(--color-seriousness-medium); color: #000; }
        .popup-seriousness.high { background: var(--color-seriousness-high); }
        .popup-seriousness.critical { background: var(--color-seriousness-critical); }

        .popup-category-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-color);
        }

        .map-popup-title-ml {
          font-size: 11px;
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .popup-divider {
          height: 1px;
          background: var(--border-color);
          margin: 6px 0;
        }

        .popup-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .popup-status-badge {
          font-size: 9.5px;
          font-weight: 700;
        }

        .map-popup-btn {
          background: var(--accent-color);
          color: white !important;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .map-popup-btn:hover {
          background: var(--accent-hover);
        }

        @media (max-width: 768px) {
          .map-view-container {
            height: 480px;
          }
          
          .map-legend-board {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
