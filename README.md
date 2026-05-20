# 👁️ UrbanEye: Smart Unified Complaint Portal

> **കേരളത്തിലെ നഗരകണ്ണ് (UrbanEye)** — A Premium Web Application merging secure civic grievance reporting, autonomous priority scheduling, dynamic starvation prevention, and geographical route optimization.

UrbanEye is a next-generation smart complaint management system designed for municipal governance in Kerala. Built using **React (Vite)**, **Vanilla HSL CSS variables**, and **Leaflet GIS Maps**, it provides citizens with verified report logging and municipal technicians with optimal route dispatch capabilities.

---

## ✨ Advanced Features & Core Subsystems

### 1. 🔒 Full-Screen Login Gate
* **Identity Protection:** Hides all dashboards, maps, and tabs under a high-fidelity glassmorphic overlay until authentication is verified.
* **Dual Roles:** Securely manages distinct citizen and administrative session states.

### 2. 👤 Citizen Identity Verification & Personalized Dashboards
* **WhatsApp Sim Integration:** Citizens verify identity via a simulated WhatsApp chat bot with real-time **4-digit SMS OTP verification**.
* **Personalized Dashboard Split:** Citizens view their submissions under a dedicated **"My Complaints"** tab, separate from the public **"Community Issues"** feed.
* **Anti-Spam Upvote Protection:** Citizens are limited to **exactly one upvote per ticket** to prevent duplicate concern spikes. Upvoted cards and detailed views highlight with an amber-gold glow (`#f59e0b`).

### 3. 🛡️ Multi-Level Departmental Admins & Scoped Views
* **Jurisdictional Scopes:** Supports hierarchical administrative accounts (Panchayath, District, State) for municipal sectors (Road, Water, Health, Waste Management, Electricity, Other).
* **Automated Data Scoping:** Admins are automatically routed to their department and authority level, filtering the dashboard, lists, and maps to display only relevant local complaints.

### 4. 🛠️ Proximity Route Optimizer (Atomic Batch Scheduling)
* **Resource Optimization:** When an administrator schedules an unresolved critical/high issue, the system automatically scans for minor unresolved issues in the **same district**.
* **Unified State Dispatch:** Batches nearby minor issues onto the technician’s route, updating their schedules atomically in a single state cycle to maximize travel efficiency.

### 5. ⏳ Starvation Prevention & Time-Warp Engine
* **Dynamic Escalation:** Prevents low-priority tickets from starving in the queue.
* **Incremental Priority Progression:** Unresolved complaints age level-by-level (by 1 level for every 7 days: `Low` ➡️ `Medium` ➡️ `High` ➡️ `Critical`) instead of jumping directly to critical.
* **Time-Warp Simulator & Reset:** Evaluators can warp time via the **"Age +7 Days"** button, shifting history back in state, or revert all simulations back to original baseline seed data in one click using **"Reset Warp"**.

### 6. 📊 Custom GIS Maps & SVG Analytics
* **Leaflet GIS Integration:** Projects active complaints as color-coded, glowing pins on a map.
* **Insights Dashboard:** Custom-handwritten responsive SVG Bar Charts (grievances by category) and SVG Radial Segment Donut Charts (lifecycles).
* **Live Leaderboards:** Dynamically ranks all 14 Kerala districts based on municipal resolution efficiency.

---

## 🔑 Demo Credentials

To experience both user pathways and different departmental scopes immediately, use these preseeded profiles:

| Role | Username | Password | Actions Available |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen` | `123` | File reports, upvote once, WhatsApp OTP wizard, view feed/maps. |
| **Super Admin** | `admin` | `admin` | Full state-wide super-user access to all grievances, maps, SVG metrics and scheduling. |
| **Panchayath Road Admin** | `panchayath_road` | `123` | Localized road/pothole administration at the Panchayath level. |
| **District Road Admin** | `district_road` | `123` | Regional road grievance reviews and batched route optimization. |
| **State Water Admin** | `state_water` | `123` | State-wide control over waterlogging and water supply issues. |

---

## 🛠️ Installation & Setup

Make sure you have [Node.js](https://nodejs.org/) installed, then follow these instructions:

### 1. Clone the project
```bash
git clone <your-repository-url>
cd Mini_project-main
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local developer server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for production (optional)
```bash
npm run build
```
This builds optimized client chunks in the `/dist` directory with zero errors or warnings.

---

## 📁 Project Structure

```text
├── index.html               # Main entry HTML (SEO tags, viewport configs)
├── package.json             # Core dependency list & scripts
├── vite.config.js           # Vite configurations
├── public/                  # Static assets
└── src/
    ├── App.jsx              # Main State manager, Landing Gate & Aging Engine
    ├── index.css            # Global CSS variables, HSL tokens, scrollbars, animations
    ├── main.jsx             # React entrypoint mounting root
    ├── components/
    │   ├── Header.jsx       # Top navigation, light/dark switch & warp buttons
    │   ├── ComplaintFeed.jsx# Horizontal chips, search inputs & status toggles
    │   ├── ComplaintCard.jsx# Complaint cards with highlighted upvoted states
    │   ├── ComplaintDetails.jsx # E-commerce steppers, Leaflet map, comments, and admin optimizer
    │   ├── InteractiveMap.jsx # Custom Leaflet GIS map projector
    │   ├── Leaderboard.jsx  # Kerala dynamic district rank board
    │   ├── Dashboard.jsx    # Custom responsive SVG charts
    │   ├── ReportModal.jsx  # 3-step complaint wizard with Leaflet locator
    │   └── WhatsAppChatSim.jsx # Simulated WhatsApp OTP pipeline
    └── utils/
        ├── seedData.js      # 10 highly detailed bilingual preseeded Kerala complaints
        └── storage.js       # Persistent storage hooks namespace prefixed
```

---

## 🎓 College Project Evaluation Points

If presenting this project to evaluators, highlight the following:
1. **Glassmorphism CSS Design**: Pure HSL CSS properties, transitions, and animations with zero external styling frameworks.
2. **Atomic Dispatch Optimization**: Prevents stale asynchronous React closures by updating batched collections in unified state actions.
3. **Starvation Protection Engine**: Mathematical calculation of grievance duration to escalate priority automatically over simulated elapsed days.
4. **Data Persistence**: Synchronizes states locally via namespaces to maintain all user edits across session reloads.
