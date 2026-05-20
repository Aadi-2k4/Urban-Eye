// storage.js - LocalStorage CRUD operations with a self-healing Data Migration Engine for backwards compatibility
import { initialComplaints } from "./seedData";

const COMPLAINTS_KEY = "urbaneye_complaints";
const THEME_KEY = "urbaneye_theme";
const USERS_KEY = "urbaneye_users";
const SESSION_KEY = "urbaneye_session";
const AGED_DAYS_KEY = "urbaneye_aged_days";

// Automatically upgrades and sanitizes legacy complaints to prevent crashes from old data structures
const sanitizeComplaint = (c) => {
  if (!c) return null;

  // Extract legacy coordinates or fall back to Kerala center
  let lat = 10.0159;
  let lng = 76.3419;
  let locationStr = "Kakkanad, Ernakulam";

  if (typeof c.location === "object" && c.location !== null) {
    lat = c.location.lat || lat;
    lng = c.location.lng || lng;
    locationStr = c.location.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } else if (typeof c.location === "string" && c.location.trim() !== "") {
    locationStr = c.location;
    lat = c.lat || lat;
    lng = c.lng || lng;
  }

  // Pre-loaded realistic image attachments fallbacks
  const fallbackImage = c.image || (c.media && c.media.length > 0 ? c.media[0].preview : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80");

  return {
    id: c.id ? c.id.toString() : "c-" + Date.now() + Math.random().toString(36).substr(2, 5),
    category: c.category || "other",
    titleEn: c.titleEn || c.heading || "Untitled Civic Issue",
    titleMl: c.titleMl || "റോഡിൽ അസൗകര്യമുണ്ടാക്കുന്ന പൊതു പ്രശ്നം",
    descEn: c.descEn || c.text || "No detailed description provided.",
    descMl: c.descMl || "വിശദാംശങ്ങൾ ലഭ്യമാക്കിയിട്ടില്ല.",
    location: locationStr,
    district: c.district || "EKM",
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    image: fallbackImage,
    createdAt: c.createdAt || Date.now(),
    status: c.status || "submitted",
    seriousness: c.seriousness || "medium",
    originalSeriousness: c.originalSeriousness || c.seriousness || "medium",
    citizen: c.citizen || "Verified Citizen",
    upvotes: c.upvotes || 0,
    upvotedBy: c.upvotedBy || [],
    comments: c.comments || []
  };
};

// Complaints CRUD with full sanitization
export const getComplaints = () => {
  try {
    const data = localStorage.getItem(COMPLAINTS_KEY);
    if (!data) {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(initialComplaints));
      return initialComplaints;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(initialComplaints));
      return initialComplaints;
    }
    // Clean and migrate all records dynamically
    return parsed.map(sanitizeComplaint).filter(Boolean);
  } catch (e) {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(initialComplaints));
    return initialComplaints;
  }
};

export const saveComplaints = (complaints) => {
  try {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  } catch (e) {
    console.error("Storage write error: ", e);
  }
};

// Theme Management
export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch (e) {
    return "dark";
  }
};

export const saveStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error("Theme write error: ", e);
  }
};

// Simulated Time Machine Aging State
export const getSimulatedAgedDays = () => {
  try {
    const val = localStorage.getItem(AGED_DAYS_KEY);
    const parsed = parseInt(val || "0", 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    return 0;
  }
};

export const saveSimulatedAgedDays = (days) => {
  try {
    localStorage.setItem(AGED_DAYS_KEY, days.toString());
  } catch (e) {
    console.error("Aged days write error: ", e);
  }
};

// User Accounts Management
const defaultUsers = [
  { name: "Ragesh K.", username: "citizen", password: "123", role: "citizen" },
  { name: "Devika S.", username: "devika", password: "123", role: "citizen" }
];

export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : defaultUsers;
  } catch (e) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    } catch (innerErr) {}
    return defaultUsers;
  }
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Users write error: ", e);
  }
};

// User Session Management
export const getStoredSession = () => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data || data === "undefined") return null;
    return JSON.parse(data);
  } catch (e) {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (innerErr) {}
    return null;
  }
};

export const saveSession = (user) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Session write error: ", e);
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error("Session clear error: ", e);
  }
};
