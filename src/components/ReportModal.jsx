// ReportModal.jsx - Citizen Reporting Form & WhatsApp Simulator Integration
import React, { useState, useEffect } from "react";
import { X, Megaphone, Smartphone, MapPin, Sparkles, Image as ImageIcon, CheckCircle, ShieldAlert } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import WhatsAppChatSim from "./WhatsAppChatSim";
import { districtNames } from "../utils/seedData";
import { translateEnglishToMalayalam } from "../utils/translator";

// Fix Leaflet marker icon asset issue in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Map View Panning Helper Component
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

// Marker component that listens to clicks on the map to set location coordinates
function LocationPickerMarker({ lat, lng, setLat, setLng }) {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat.toFixed(6));
      setLng(e.latlng.lng.toFixed(6));
    },
  });

  return lat && lng ? (
    <Marker position={[parseFloat(lat), parseFloat(lng)]} icon={customIcon} />
  ) : null;
}

const DISTRICT_CENTERS = {
  EKM: [9.9816, 76.2999],
  MPM: [11.0735, 76.0740],
  TVM: [8.5241, 76.9366],
  TSR: [10.5276, 76.2144],
  KKD: [11.2588, 75.7804],
  PKD: [10.7867, 76.6547],
  KLM: [8.8932, 76.6141],
  ALP: [9.4981, 76.3388],
  KTM: [9.5916, 76.5222],
  KSD: [12.5103, 74.9852],
  KNR: [11.8745, 75.3704],
  WYD: [11.6854, 76.1320],
  IDK: [9.9189, 77.1025],
  PTA: [9.2648, 76.7870]
};

// Unsplash presets for categories
const CATEGORY_PRESETS = {
  pothole: [
    { name: "Pothole Close-up", url: "https://images.unsplash.com/photo-1599740831146-80cf4bde309b?w=800&auto=format&fit=crop&q=80" },
    { name: "Damaged Highway", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=80" }
  ],
  waste: [
    { name: "Waterway Litter", url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80" },
    { name: "Roadside Garbage heap", url: "https://images.unsplash.com/photo-1605600611280-1a7435f9bad6?w=800&auto=format&fit=crop&q=80" }
  ],
  streetlight: [
    { name: "Dark Streetlamp", url: "https://images.unsplash.com/photo-1509024640554-6cad6222b07e?w=800&auto=format&fit=crop&q=80" },
    { name: "Unlit Junction", url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80" }
  ],
  waterlogging: [
    { name: "Road Waterlogging", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80" },
    { name: "Flooded Walkway", url: "https://images.unsplash.com/photo-1485848395967-65dff62dc35b?w=800&auto=format&fit=crop&q=80" }
  ],
  property: [
    { name: "Obstruction Drum", url: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&auto=format&fit=crop&q=80" },
    { name: "Dangling Cables", url: "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800&auto=format&fit=crop&q=80" }
  ],
  other: [
    { name: "Broken Footpath", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80" },
    { name: "Overgrown Vegetation", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80" }
  ]
};

// Simple dictionary for mock translation
const MOCK_TRANSLATIONS = {
  pothole: {
    titleMl: "റോഡിൽ വലിയ കുഴി രൂപപ്പെട്ടിരിക്കുന്നു",
    descMl: "ഈ ഭാഗത്ത് റോഡിലെ ടാർ ഇളകി വലിയ കുഴി രൂപപ്പെട്ടിരിക്കുന്നു. വലിയ അപകടഭീഷണിയാണ് ഇത് ഉണ്ടാക്കുന്നത്. അടിയന്തരമായി പരിഹരിക്കണം."
  },
  waste: {
    titleMl: "പൊതുസ്ഥലത്ത് പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ അടിഞ്ഞുകൂടി കിടക്കുന്നു",
    descMl: "ഇവിടെ റോഡരികിലും ജലാശയത്തിലും വൻതോതിൽ പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ കെട്ടിക്കിടക്കുന്നു. ദുർഗന്ധവും കൊതുക് ശല്യവും അതിരൂക്ഷമാണ്."
  },
  streetlight: {
    titleMl: "തെരുവ് വിളക്ക് കേടാണ്, പ്രകാശം ലഭിക്കുന്നില്ല",
    descMl: "തെരുവ് വിളക്ക് കഴിഞ്ഞ ഒരാഴ്ചയായി കത്തുന്നില്ല. രാത്രികാലങ്ങളിൽ കാൽനടയാത്രക്കാർക്കും വാഹനങ്ങൾക്കും വഴി കാണാൻ വലിയ ബുദ്ധിമുട്ടാണ്."
  },
  waterlogging: {
    titleMl: "റോഡിൽ കനത്ത വെള്ളക്കെട്ട് രൂപപ്പെട്ടിരിക്കുന്നു",
    descMl: "ചെറിയ മഴയിൽ പോലും റോഡിൽ ഓടകൾ അടഞ്ഞു കനത്ത വെള്ളക്കെട്ട് ഉണ്ടാകുന്നു. വാഹനങ്ങൾ അപകടത്തിൽ പെടാൻ സാധ്യതയുണ്ട്."
  },
  property: {
    titleMl: "നടപ്പാതയിൽ വലിയ തടസ്സം ഉപേക്ഷിച്ച നിലയിൽ കാണപ്പെടുന്നു",
    descMl: "പൊതു നടപ്പാത തടസ്സപ്പെടുത്തി വലിയ വസ്തുക്കൾ ഉപേക്ഷിച്ചിരിക്കുന്നു. കാൽനടയാത്രക്കാർ റോഡിലിറങ്ങി നടക്കേണ്ട അവസ്ഥയാണ്."
  },
  other: {
    titleMl: "പൊതുജനങ്ങൾക്ക് അസൗകര്യമുണ്ടാക്കുന്ന അടിയന്തര പ്രശ്നം",
    descMl: "ഈ ഭാഗത്തെ പ്രധാന സാമൂഹിക പ്രശ്നം അടിയന്തരമായി പരിഹരിച്ച് പൊതുജനങ്ങളുടെ സുരക്ഷ ഉറപ്പാക്കണം."
  }
};

export default function ReportModal({ isOpen, onClose, onNewComplaint, currentUser, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("direct"); // direct | whatsapp
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [category, setCategory] = useState("pothole");
  const [titleEn, setTitleEn] = useState("");
  const [titleMl, setTitleMl] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descMl, setDescMl] = useState("");
  const [district, setDistrict] = useState("EKM");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [imageUrl, setImageUrl] = useState(CATEGORY_PRESETS.pothole[0].url);
  const [seriousness, setSeriousness] = useState("medium");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateDescLoading, setTranslateDescLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState(DISTRICT_CENTERS.EKM);
  const [customImage, setCustomImage] = useState(null);

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    // If they have a custom image uploaded, prioritize it, otherwise set first preset
    if (customImage) {
      setImageUrl(customImage);
    } else {
      setImageUrl(CATEGORY_PRESETS[cat][0].url);
    }
  };

  const handleDistrictChange = (code) => {
    setDistrict(code);
    const center = DISTRICT_CENTERS[code] || DISTRICT_CENTERS.EKM;
    setMapCenter(center);
    setLat(center[0].toFixed(6));
    setLng(center[1].toFixed(6));
  };

  const handleFetchGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude.toFixed(6));
          setLng(longitude.toFixed(6));
          setMapCenter([latitude, longitude]);
          setGpsLoading(false);
        },
        (error) => {
          // Standard mock fallback inside Kerala
          const coords = DISTRICT_CENTERS[district] || DISTRICT_CENTERS.EKM;
          const offsetLat = coords[0] + (Math.random() - 0.5) * 0.02;
          const offsetLng = coords[1] + (Math.random() - 0.5) * 0.02;
          setLat(offsetLat.toFixed(6));
          setLng(offsetLng.toFixed(6));
          setMapCenter([offsetLat, offsetLng]);
          setGpsLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      const coords = DISTRICT_CENTERS[district] || DISTRICT_CENTERS.EKM;
      setLat(coords[0].toFixed(6));
      setLng(coords[1].toFixed(6));
      setMapCenter(coords);
      setGpsLoading(false);
    }
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target.result;
      setCustomImage(base64Url);
      setImageUrl(base64Url); // Automatically select the uploaded image!
    };
    reader.readAsDataURL(file);
  };

  const handleAutoTranslate = async () => {
    if (!titleEn.trim()) return;
    setTranslateLoading(true);
    try {
      const translatedTitle = await translateEnglishToMalayalam(titleEn, category, "title");
      setTitleMl(translatedTitle);
    } catch (error) {
      console.error("Auto translation failed:", error);
    } finally {
      setTranslateLoading(false);
    }
  };

  const handleTranslateDesc = async () => {
    if (!descEn.trim()) return;
    setTranslateDescLoading(true);
    try {
      const translatedDesc = await translateEnglishToMalayalam(descEn, category, "desc");
      setDescMl(translatedDesc);
    } catch (error) {
      console.error("Auto translation failed:", error);
    } finally {
      setTranslateDescLoading(false);
    }
  };


  const handleNextStep1 = () => {
    if (!titleEn.trim() || !descEn.trim()) {
      alert("Please fill in the English Title and English Description.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!location.trim() || !lat || !lng) {
      alert("Please specify the Landmark and fetch GPS coordinates.");
      return;
    }
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titleEn || !descEn || !location || !lat || !lng) {
      alert("Please fill in all required fields and fetch GPS coordinates.");
      return;
    }

    const newComplaint = {
      id: "portal-" + Date.now(),
      category,
      titleEn,
      titleMl: titleMl || titleEn,
      descEn,
      descMl: descMl || descEn,
      location,
      district,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      image: imageUrl,
      createdAt: Date.now(),
      status: "submitted",
      seriousness,
      originalSeriousness: seriousness,
      citizen: currentUser ? currentUser.name : "Verified Citizen",
      upvotes: 0,
      upvotedBy: [],
      comments: []
    };

    onNewComplaint(newComplaint);
    setSuccess(true);
    alert("Grievance registered successfully!");
    setTimeout(() => {
      setSuccess(false);
      onClose();
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setTitleEn("");
    setTitleMl("");
    setDescEn("");
    setDescMl("");
    setLocation("");
    setLat("");
    setLng("");
    setCategory("pothole");
    setImageUrl(CATEGORY_PRESETS.pothole[0].url);
    setCustomImage(null);
    setMapCenter(DISTRICT_CENTERS.EKM);
    setSeriousness("medium");
    setStep(1);
  };

  return (
    <div className="report-overlay">
      <div className={`report-modal glass ${activeTab === "whatsapp" ? "wa-mode" : ""}`}>
        {/* Header */}
        <div className="report-header">
          <div className="header-title-box">
            <Megaphone size={20} color="var(--accent-color)" />
            <h3>Submit Public Grievance</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Grievance Modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="report-tabs">
          <button
            onClick={() => setActiveTab("direct")}
            className={`report-tab-btn ${activeTab === "direct" ? "active" : ""}`}
          >
            <Megaphone size={14} />
            <span>Direct Web Grievance</span>
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`report-tab-btn ${activeTab === "whatsapp" ? "active" : ""}`}
          >
            <Smartphone size={14} />
            <span>Secure WhatsApp Bot</span>
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "whatsapp" ? (
          <div className="tab-content wa-chat-tab">
            <WhatsAppChatSim 
              currentUser={currentUser} 
              onNewComplaint={(comp) => {
                onNewComplaint(comp);
                onClose();
              }} 
              resetForm={resetForm}
            />
          </div>
        ) : (
          <div className="tab-content form-tab">
            {!currentUser ? (
              <div className="auth-alert-panel glass">
                <ShieldAlert size={48} color="var(--color-seriousness-high)" />
                <h4>Citizen Identity Verification Required</h4>
                <p>
                  To eliminate spam and anonymous/false complaints, citizens must be verified with an authenticated session before filing formal public grievances.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="btn-auth-verify pulse-glow"
                >
                  Verify Your Citizen Identity Now
                </button>
              </div>
            ) : success ? (
              <div className="success-panel glass">
                <CheckCircle size={56} color="var(--color-resolved)" />
                <h4>Complaint Filed Successfully!</h4>
                <p>Ref: #CP-{Date.now().toString().slice(-4)}</p>
                <p className="subtext">Adding to the live tracker, seeding maps, and routing resolution teams...</p>
              </div>
            ) : (
              <div className="wizard-form-container">
                {/* Stepper Progress Indicator */}
                <div className="stepper-container">
                  {[
                    { number: 1, label: "Details" },
                    { number: 2, label: "Location" },
                    { number: 3, label: "Submit" }
                  ].map((s) => (
                    <div key={s.number} className={`step-indicator ${step === s.number ? "active" : step > s.number ? "completed" : ""}`}>
                      <div className="step-circle">{step > s.number ? "✓" : s.number}</div>
                      <span className="step-label">{s.label}</span>
                      {s.number < 3 && <div className="step-line" />}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="grievance-form">
                  {/* STEP 1: CATEGORY & DETAILS */}
                  {step === 1 && (
                    <div className="wizard-step-content animate-fade-in">
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Category</label>
                          <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                            <option value="pothole">Road & Pothole Damage</option>
                            <option value="waste">Public Waste & Litter</option>
                            <option value="streetlight">Broken Streetlights</option>
                            <option value="waterlogging">Waterlogging & Drainage</option>
                            <option value="property">Obstructions & Encroachment</option>
                            <option value="other">Other Grievances</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Issue Seriousness</label>
                          <select value={seriousness} onChange={(e) => setSeriousness(e.target.value)}>
                            <option value="low">Low (Resolve within 15 Days)</option>
                            <option value="medium">Medium (Resolve within 10 Days)</option>
                            <option value="high">High (Resolve within 5 Days)</option>
                            <option value="critical">Critical (Immediate - Resolve in 2 Days)</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Complaint Title (English) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Large pothole near Kakkanad Civil Station"
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <div className="label-with-action">
                          <label>Complaint Title (Malayalam)</label>
                          <button type="button" className="btn-action-sparkle" onClick={handleAutoTranslate}>
                            <Sparkles size={12} />
                            <span>{translateLoading ? "Translating..." : "Auto-Translate"}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. റോഡിൽ വലിയ കുഴി രൂപപ്പെട്ടിരിക്കുന്നു"
                          value={titleMl}
                          onChange={(e) => setTitleMl(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Detailed Description (English) *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Provide depth, visual cues, and safety threats regarding the complaint..."
                          value={descEn}
                          onChange={(e) => setDescEn(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <div className="label-with-action">
                          <label>Detailed Description (Malayalam)</label>
                          <button type="button" className="btn-action-sparkle" onClick={handleTranslateDesc}>
                            <Sparkles size={12} />
                            <span>{translateDescLoading ? "Translating..." : "Auto-Translate"}</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="സംഭവം കൂടുതൽ വ്യക്തമാക്കുക..."
                          value={descMl}
                          onChange={(e) => setDescMl(e.target.value)}
                        />
                      </div>

                      <div className="form-actions-row">
                        <div />
                        <button type="button" className="btn-wizard-next" onClick={handleNextStep1}>
                          <span>Next: Specify Location</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: LOCATION */}
                  {step === 2 && (
                    <div className="wizard-step-content animate-fade-in">
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>District *</label>
                          <select value={district} onChange={(e) => handleDistrictChange(e.target.value)}>
                            {Object.entries(districtNames).map(([code, names]) => (
                              <option key={code} value={code}>
                                {names.nameEn} ({names.nameMl})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Specific Landmark / Address *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Near HDFC Bank, Kakkanad Round"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-row-gps">
                        <div className="form-group">
                          <label>GPS Latitude *</label>
                          <input type="text" placeholder="10.015900" required value={lat} readOnly />
                        </div>
                        <div className="form-group">
                          <label>GPS Longitude *</label>
                          <input type="text" placeholder="76.341900" required value={lng} readOnly />
                        </div>
                        <button type="button" className="btn-gps" onClick={handleFetchGPS} disabled={gpsLoading}>
                          <MapPin size={16} />
                          <span>{gpsLoading ? "Fetching..." : "Fetch GPS"}</span>
                        </button>
                      </div>

                      <div className="form-group" style={{ margin: "16px 0" }}>
                        <label style={{ marginBottom: "6px", display: "block" }}>Click on the map to pick/fine-tune location *</label>
                        <div style={{ height: "240px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", position: "relative", zIndex: 10 }}>
                          <MapContainer
                            center={mapCenter}
                            zoom={12}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={true}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <ChangeMapView center={mapCenter} />
                            <LocationPickerMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
                          </MapContainer>
                        </div>
                      </div>

                      <div className="form-actions-row">
                        <button type="button" className="btn-wizard-back" onClick={() => setStep(1)}>
                          Back to Details
                        </button>
                        <button type="button" className="btn-wizard-next" onClick={handleNextStep2}>
                          <span>Next: Attachment & Review</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ATTACHMENT & REVIEW */}
                  {step === 3 && (
                    <div className="wizard-step-content animate-fade-in">
                      {/* Photo Preset Attachment Selector */}
                      <div className="form-group">
                        <label>Choose Grievance Photo Attachment</label>
                        <div className="preset-images-grid">
                          {CATEGORY_PRESETS[category].map((preset, idx) => (
                            <div
                              key={idx}
                              className={`preset-img-card ${imageUrl === preset.url ? "selected" : ""}`}
                              onClick={() => setImageUrl(preset.url)}
                            >
                              <img src={preset.url} alt={preset.name} />
                              <span className="preset-img-tag">{preset.name}</span>
                            </div>
                          ))}
                          {customImage && (
                            <div
                              className={`preset-img-card ${imageUrl === customImage ? "selected" : ""}`}
                              onClick={() => setImageUrl(customImage)}
                            >
                              <img src={customImage} alt="Uploaded Media" />
                              <span className="preset-img-tag">Uploaded Media</span>
                            </div>
                          )}
                        </div>

                        {/* File Upload Selector Dropzone */}
                        <div className="custom-upload-zone glass">
                          <ImageIcon size={24} className="upload-icon" />
                          <div className="upload-text-box">
                            <span className="upload-title">Or Upload Your Own Photo</span>
                            <span className="upload-subtitle">Drag & drop or click to browse (Max 5MB)</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleCustomImageUpload} 
                            className="hidden-file-input" 
                          />
                        </div>
                      </div>

                      {/* Summary Review Board */}
                      <div className="review-panel">
                        <h4 className="review-title">Review Grievance Summary</h4>
                        <div className="review-grid">
                          <span className="review-label">Category:</span>
                          <span className="review-value">{category.toUpperCase()}</span>

                          <span className="review-label">Priority:</span>
                          <span className="review-value">{seriousness.toUpperCase()}</span>

                          <span className="review-label">Title (En):</span>
                          <span className="review-value">{titleEn}</span>

                          {titleMl && (
                            <>
                              <span className="review-label">Title (Ml):</span>
                              <span className="review-value">{titleMl}</span>
                            </>
                          )}

                          <span className="review-label">Location:</span>
                          <span className="review-value">
                            {districtNames[district]?.nameEn || district}, {location} <br />
                            <small className="text-muted">GPS Coords: {lat}, {lng}</small>
                          </span>
                        </div>

                        <div className="review-thumbnail-container">
                          <span className="review-label">Selected Photo:</span>
                          <img src={imageUrl} alt="Attached Preview" className="review-thumbnail" />
                        </div>
                      </div>

                      <div className="form-actions-row">
                        <button type="button" className="btn-wizard-back" onClick={() => setStep(2)}>
                          Back to Location
                        </button>
                        <button type="submit" className="btn-submit-grievance ripple-hover pulse-glow">
                          <CheckCircle size={18} />
                          <span>Submit Grievance</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .report-overlay {
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
          padding: 16px;
        }

        .report-modal {
          width: 100%;
          max-width: 680px;
          max-height: 95vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 24px;
          transition: max-width var(--transition-normal);
        }

        .report-modal.wa-mode {
          max-width: 860px;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        .header-title-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-title-box h3 {
          font-size: 20px;
          font-weight: 700;
        }

        .close-btn {
          color: var(--text-muted);
          transition: color var(--transition-fast);
          padding: 4px;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .report-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          padding: 4px;
          border: 1px solid var(--border-color);
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .report-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 4px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .report-tab-btn.active {
          color: var(--text-primary);
          background: var(--bg-input);
          border: 1px solid var(--border-color);
        }

        .tab-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }

        /* Stepper progress indicator */
        .stepper-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          margin-bottom: 24px;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
        }

        .step-indicator:last-child {
          flex: none;
        }

        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          z-index: 2;
        }

        .step-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .step-line {
          position: absolute;
          left: 100px;
          right: 20px;
          height: 2px;
          background: var(--border-color);
          z-index: 1;
          transition: all var(--transition-fast);
        }

        .step-indicator.active .step-circle {
          border-color: var(--accent-color);
          background: var(--accent-color);
          color: white;
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .step-indicator.active .step-label {
          color: var(--text-primary);
        }

        .step-indicator.completed .step-circle {
          border-color: var(--color-resolved);
          background: var(--color-resolved);
          color: white;
        }

        .step-indicator.completed .step-line {
          background: var(--color-resolved);
        }

        .step-indicator.completed .step-label {
          color: var(--color-resolved);
        }

        .auth-alert-panel, .success-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
          background: var(--bg-secondary);
          gap: 16px;
        }

        .auth-alert-panel h4 {
          font-size: 18px;
          color: var(--text-primary);
        }

        .auth-alert-panel p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 440px;
        }

        .btn-auth-verify {
          background: var(--accent-color);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .btn-auth-verify:hover {
          background: var(--accent-hover);
        }

        .success-panel h4 {
          font-size: 20px;
          color: var(--color-resolved);
        }

        .success-panel p {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .success-panel .subtext {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .grievance-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: left;
        }

        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-action-sparkle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--accent-glow);
          color: var(--accent-color);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-action-sparkle:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-color);
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13.5px;
          transition: border var(--transition-fast);
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--border-focus);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-row-gps {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 16px;
          align-items: flex-end;
        }

        .btn-gps {
          height: 38px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-gps:hover {
          border-color: var(--accent-color);
          background: var(--bg-input);
        }

        .preset-images-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 4px;
        }

        .preset-img-card {
          position: relative;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border var(--transition-fast), transform var(--transition-fast);
        }

        .preset-img-card:hover {
          transform: translateY(-1px);
        }

        .preset-img-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preset-img-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 10px;
          padding: 4px;
          text-align: center;
          font-weight: 500;
        }

        .preset-img-card.selected {
          border-color: var(--accent-color);
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .custom-upload-zone {
          position: relative;
          margin-top: 12px;
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: rgba(255, 255, 255, 0.03);
        }

        .custom-upload-zone:hover {
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.06);
        }

        .hidden-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .upload-icon {
          color: var(--accent-color);
          opacity: 0.8;
        }

        .upload-text-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .upload-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-color);
        }

        .upload-subtitle {
          font-size: 11px;
          color: var(--text-color);
          opacity: 0.6;
        }

        /* Wizard Form Elements */
        .review-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid var(--border-color);
          text-align: left;
        }

        .review-title {
          font-size: 14px;
          font-weight: 700;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
          color: var(--text-primary);
        }

        .review-grid {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 10px 16px;
          font-size: 13px;
        }

        .review-label {
          font-weight: 600;
          color: var(--text-muted);
        }

        .review-value {
          color: var(--text-primary);
          line-height: 1.4;
        }

        .review-thumbnail-container {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: 8px;
        }

        .review-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .form-actions-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-wizard-back {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-wizard-back:hover {
          background: var(--bg-input);
          border-color: var(--text-muted);
        }

        .btn-wizard-next {
          background: var(--accent-color);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-wizard-next:hover {
          background: var(--accent-hover);
        }

        .btn-submit-grievance {
          background: var(--accent-color);
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .btn-submit-grievance:hover {
          background: var(--accent-hover);
        }

        @media (max-width: 576px) {
          .step-line {
            display: none;
          }
          .step-label {
            font-size: 11px;
          }
        }

        @media (max-width: 768px) {
          .form-row-2, .form-row-gps {
            grid-template-columns: 1fr;
          }
          
          .btn-gps {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
