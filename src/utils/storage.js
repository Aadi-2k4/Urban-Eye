// storage.js - LocalStorage CRUD operations with a self-healing Data Migration Engine for backwards compatibility
import { initialComplaints } from "./seedData";

const COMPLAINTS_KEY = "urbaneye_complaints";
const THEME_KEY = "urbaneye_theme";
const USERS_KEY = "urbaneye_users";
const SESSION_KEY = "urbaneye_session";
const AGED_DAYS_KEY = "urbaneye_aged_days";

// Constants for Hierarchy Levels and Departments
export const HIERARCHY_LEVELS = {
  PANCHAYATH: "panchayath",
  DISTRICT: "district",
  STATE: "state"
};

export const DEPARTMENTS = {
  ROAD: "Road",
  WATER: "Water",
  HEALTH: "Health",
  WASTE_MANAGEMENT: "Waste Management",
  ELECTRICITY: "Electricity",
  OTHER: "Other"
};

export const CATEGORY_TO_DEPARTMENT = {
  pothole: DEPARTMENTS.ROAD,
  property: DEPARTMENTS.ROAD,
  waterlogging: DEPARTMENTS.WATER,
  waste: DEPARTMENTS.WASTE_MANAGEMENT,
  streetlight: DEPARTMENTS.ELECTRICITY,
  health: DEPARTMENTS.HEALTH,
  other: DEPARTMENTS.OTHER
};

// Centralized role and permission management
export const getAdminInfoFromRole = (role) => {
  if (!role) return null;
  
  // legacy admin is treated as Super Admin
  if (role === "admin" || role === "ADMIN") {
    return { isSuperAdmin: true };
  }
  
  const parts = role.toUpperCase().split("_");
  if (parts.length >= 3 && parts[parts.length - 1] === "ADMIN") {
    const levelStr = parts[0];
    const deptStr = parts.slice(1, parts.length - 1).join("_");
    
    let level = HIERARCHY_LEVELS.PANCHAYATH;
    if (levelStr === "PANCHAYATH") level = HIERARCHY_LEVELS.PANCHAYATH;
    else if (levelStr === "DISTRICT") level = HIERARCHY_LEVELS.DISTRICT;
    else if (levelStr === "STATE") level = HIERARCHY_LEVELS.STATE;
    
    let department = DEPARTMENTS.OTHER;
    if (deptStr === "ROAD") department = DEPARTMENTS.ROAD;
    else if (deptStr === "WATER") department = DEPARTMENTS.WATER;
    else if (deptStr === "HEALTH") department = DEPARTMENTS.HEALTH;
    else if (deptStr === "WASTE" || deptStr === "WASTE_MANAGEMENT") department = DEPARTMENTS.WASTE_MANAGEMENT;
    else if (deptStr === "ELECTRICITY") department = DEPARTMENTS.ELECTRICITY;
    
    return { level, department, isSuperAdmin: false };
  }
  
  return null;
};

// Checks if the user is any admin
export const isUserAdmin = (user) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  const adminInfo = getAdminInfoFromRole(user.role);
  return !!adminInfo;
};

// Checks if the admin user is authorized to manage/view the specific complaint
export const canManageComplaint = (user, complaint) => {
  if (!user) return false;
  if (user.role === "admin" || user.role === "ADMIN") return true; // Super Admin bypass
  
  const adminInfo = getAdminInfoFromRole(user.role);
  if (!adminInfo) return false; // Citizen cannot do admin tasks
  
  // Must match both level and department
  return (
    complaint.hierarchyLevel === adminInfo.level &&
    complaint.assignedDepartment === adminInfo.department
  );
};

// Checks if the admin has rights to reset the aging timer (District and State admins, or Super Admin)
export const canResetAging = (user) => {
  if (!user) return false;
  if (user.role === "admin" || user.role === "ADMIN") return true; // Super Admin bypass
  
  const adminInfo = getAdminInfoFromRole(user.role);
  if (!adminInfo) return false;
  
  return adminInfo.level === HIERARCHY_LEVELS.DISTRICT || adminInfo.level === HIERARCHY_LEVELS.STATE;
};

// Checks if the admin is allowed to escalate the complaint
export const canEscalate = (user, complaint) => {
  if (!user || !complaint) return false;
  if (user.role === "admin" || user.role === "ADMIN") return true; // Super Admin bypass
  
  const adminInfo = getAdminInfoFromRole(user.role);
  if (!adminInfo) return false;
  
  // Can only escalate if they are currently managing it
  if (!canManageComplaint(user, complaint)) return false;
  
  // State admins cannot escalate further
  return complaint.hierarchyLevel !== HIERARCHY_LEVELS.STATE;
};

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

  const category = c.category || "other";
  let department = c.assignedDepartment;
  if (!department) {
    if (category === "pothole" || category === "property") department = DEPARTMENTS.ROAD;
    else if (category === "waterlogging") department = DEPARTMENTS.WATER;
    else if (category === "waste") department = DEPARTMENTS.WASTE_MANAGEMENT;
    else if (category === "streetlight") department = DEPARTMENTS.ELECTRICITY;
    else if (category === "health") department = DEPARTMENTS.HEALTH;
    else department = DEPARTMENTS.OTHER;
  }

  return {
    id: c.id ? c.id.toString() : "c-" + Date.now() + Math.random().toString(36).substr(2, 5),
    category: category,
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
    comments: c.comments || [],
    
    // New fields
    hierarchyLevel: c.hierarchyLevel || HIERARCHY_LEVELS.PANCHAYATH,
    originalHierarchyLevel: c.originalHierarchyLevel || c.hierarchyLevel || HIERARCHY_LEVELS.PANCHAYATH,
    assignedDepartment: department,
    escalationStatus: c.escalationStatus || "none",
    escalationLog: c.escalationLog || [],
    agingResetLog: c.agingResetLog || []
  };
};

// Complaints CRUD with full sanitization
export const getComplaints = () => {
  try {
    const data = localStorage.getItem(COMPLAINTS_KEY);
    if (!data) {
      const sanitized = initialComplaints.map(sanitizeComplaint).filter(Boolean);
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(sanitized));
      return sanitized;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      const sanitized = initialComplaints.map(sanitizeComplaint).filter(Boolean);
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(sanitized));
      return sanitized;
    }
    // Clean and migrate all records dynamically
    return parsed.map(sanitizeComplaint).filter(Boolean);
  } catch (e) {
    const sanitized = initialComplaints.map(sanitizeComplaint).filter(Boolean);
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(sanitized));
    return sanitized;
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
  { name: "Devika S.", username: "devika", password: "123", role: "citizen" },
  { name: "Panchayath Road Admin", username: "panchayath_road", password: "123", role: "PANCHAYATH_ROAD_ADMIN" },
  { name: "Panchayath Health Admin", username: "panchayath_health", password: "123", role: "PANCHAYATH_HEALTH_ADMIN" },
  { name: "District Road Admin", username: "district_road", password: "123", role: "DISTRICT_ROAD_ADMIN" },
  { name: "District Health Admin", username: "district_health", password: "123", role: "DISTRICT_HEALTH_ADMIN" },
  { name: "State Water Admin", username: "state_water", password: "123", role: "STATE_WATER_ADMIN" },
  { name: "State Road Admin", username: "state_road", password: "123", role: "STATE_ROAD_ADMIN" }
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
