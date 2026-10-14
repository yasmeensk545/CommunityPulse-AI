# CommunityPulse AI
> **Report smarter. Respond faster. Build better communities.**
> *Submitted for the Challenge: "AI for Better Living & Smarter Communities"*

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20%2B%20Offline%20Rules-teal.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Problem Statement
Every day, municipalities and local neighborhoods face hundreds of infrastructure breakdowns: burst water pipes, deep road sinkholes, unlit pedestrian corridors, illegal chemical dumping, and accessibility obstructions. Traditional civic reporting portals (such as legacy 311 systems) suffer from three fatal bottlenecks:
1. **Queue Congestion & Duplicate Overload:** When an incident occurs in a high-visibility corridor, dozens of citizens submit identical complaints, flooding dispatch desks and slowing down triage.
2. **First-Come, First-Served Bias:** In urgent situations, cosmetic complaints (such as graffiti or park litter) often sit ahead of critical life-safety hazards (such as active roadway collapses in school zones) in municipal work queues.
3. **Reactive Rather Than Preventive:** Cities repair potholes and water leaks reactively after damage occurs, rather than analyzing aggregate incident telemetry to prevent infrastructure failures before they escalate.

---

## 2. Proposed Solution & Real-World Impact
**CommunityPulse AI** transforms civic incident management into a smart, predictive, and equitable civic triage platform. By combining **multimodal AI understanding (Google Gemini API)** with a transparent, **explainable multi-factor prioritization engine** and **intelligent duplicate detection**, CommunityPulse AI empowers citizens and municipal authorities to:
- **Triage by Urgency, Not Seniority:** Every report is evaluated across 5 transparent civic risk dimensions (safety risk, affected population, environmental hazard, duration, and textual urgency triggers).
- **Eliminate Duplicate Backlogs:** The system compares incoming reports against active neighborhood records using normalized text, category matching, and geospatial token similarity, presenting side-by-side verification before submission.
- **Empower Municipal Leadership with Data Telemetry:** Dynamic dashboards surface operational bottlenecks, localized incident hotspots, and actionable preventive engineering recommendations.
- **Maintain Ethical Human-in-the-Loop Governance:** AI serves as advisory decision support for routing and risk assessment; municipal officers retain final authorization on work orders and dispatches.

---

## 3. Key Features

### 🌟 Feature 1: Premium Responsive Civic Dashboard
- Modern sidebar navigation with real-time active and critical hazard badges.
- Overview metrics: Total Intake, Active/Open, High & Critical Urgency, and Resolution Rate.
- Critical Attention Alert banner immediately highlighting active life-safety emergencies.
- Dual-mode Issue Directory (interactive Card Grid and Table Views).
- Visual palette designed with clean white surfaces, deep navy typography (`#0F172A`), and teal accents (`#0D9488`).
- Accessible semantic markup, ARIA roles, and high-contrast WCAG-compliant elements.

### 📝 Feature 2: Smart Issue Reporting
- Comprehensive submission form: Title, Detailed Description, Locality/Address, Category, and Affected Population estimate.
- Optional photo upload with instant thumbnail preview and removal.
- Real-time client-side input validation with descriptive error guidance.
- Interactive *"Analyze Issue with AI"* trigger that evaluates hazards before submission.

### 🧠 Feature 3: Real AI Intelligence + Transparent Fallback
- Direct live integration with **Google Gemini 2.5 Flash** for structured JSON triage.
- **Zero-barrier experience:** Never requires an API key to run. If an API key is absent or network fails, the system seamlessly transitions to our deterministic **Local Explainable Rules Engine**.
- Absolute transparency: Source badges explicitly indicate whether an assessment originated from `Google Gemini AI (Live API)` or `Explainable Rules Engine (Offline/Default)`.

### ⚖️ Feature 4: Explainable Multi-Factor Prioritization
Scores issues from **0 to 100** based on five concrete dimensions:
1. **Potential Safety Risk (0–30 pts):** Detects acute hazards (ruptures, sinkholes, live wires, fire).
2. **Community & Population Impact (0–25 pts):** Weights vulnerable school and medical zones higher than isolated cul-de-sacs.
3. **Environmental Impact (0–20 pts):** Assesses chemical contamination, water wastage, and watershed threats.
4. **Duration & Escalation (0–15 pts):** Evaluates chronic unaddressed issues versus rapidly escalating leaks.
5. **Urgency Indicators (0–10 pts):** Scans for explicit urgency terminology.
*Priority Tiers:* **Critical (80–100)**, **High (60–79)**, **Medium (35–59)**, and **Low (0–34)** with explicit factor point breakdowns.

### 🔍 Feature 5: Explainable Duplicate Detection
- Compares new submissions against the database using Jaccard token similarity, locality token normalization, and category correlation.
- Flags potential duplicates with match confidence percentages (e.g. "84% Match Confidence").
- Presents a side-by-side comparison modal explaining *why* it was flagged.
- Gives the citizen the choice to either track the existing ticket or submit as a distinct incident. Reports are **never automatically merged or deleted**.

### 📊 Feature 6: Live Dashboard Analytics
- Real-time interactive charts built with lightweight, accessible SVG and CSS.
- **Incident Category Distribution** (horizontal proportional progress bars).
- **Priority & Urgency Spectrum** (severity breakdown with point ranges).
- **Municipal Operational Pipeline** (Reported → Under Review → In Progress → Resolved).
- **Civic Incident Hotspots** (neighborhoods with recurring issues and dominant problem types).
- **Agency Workload Allocation** (tickets distributed across municipal departments).

### 🛠️ Feature 7: Operational Report Management
- Multi-field search across title, description, locality, ID, and assigned department.
- Filter by category (8 domains), priority tier (4 levels), and operational status (4 stages).
- Sort by newest, oldest, highest priority, or lowest priority.
- Dedicated detail drawer with interactive status transitions, timeline of inspection notes, and attached photo view.
- Realistic sample community records pre-loaded and clearly marked with `[Sample Data]` badges.

### 💡 Feature 8: Community Insights & Predictive Governance
- Automatically identifies the **primary operational bottleneck category** and **high-density geographic focus areas**.
- Suggests targeted preventive measures (e.g., acoustic pipe scans, pre-winter asphalt crack sealing, smart LED luminaire upgrades).
- Outlines strategic policy recommendations for municipal administrators, clearly distinguishing data-derived metrics from advisory recommendations.

### 💾 Feature 9: Reliable Storage & Diagnostic Data Layer
- Client-side persistence using browser `localStorage` with safe schema validation.
- Graceful handling of malformed or legacy records with automated default seeding.
- Storage Diagnostics panel reporting item count, footprint in KB, and engine status.
- Export dataset to JSON and import external JSON backups.
- Quick *"Reset to Sample Data"* button to restore the standard evaluation environment at any time.

---

## 4. Technology Stack
- **Frontend Framework:** React 19 (JavaScript ESModules)
- **Build Tool:** Vite 8.3
- **Icons:** Lucide React
- **Styling:** Custom CSS Design System (clean white surfaces, deep navy typography, teal accents)
- **AI Integration:** Google Gemini 2.5 Flash (`generateContent` REST API)
- **Local Fallback:** Deterministic NLP tokenization, Jaccard similarity, and heuristic scoring engine
- **Testing:** Node.js native test runner (`node --test`)
- **Linting:** Oxlint

---

## 5. Installation & Run Commands

### Prerequisites
- Node.js `v18.0.0` or later (tested on Node `v25.2.1`)
- npm `v9.0.0` or later

### Step 1: Clone and Enter Directory
```bash
git clone https://github.com/your-username/communitypulse-ai.git
cd communitypulse-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Step 4: Build for Production
```bash
npm run build
```
The optimized production build will be generated in `dist/`.

---

## 6. AI Integration & Fallback Behavior

### Live Google Gemini AI (Optional)
To use live Google Gemini intelligence:
1. Open the application.
2. Click the **"Local AI Engine"** button or **Database Settings** icon in the top navbar.
3. Paste your Google Gemini API Key and click **"Test Key"**.
4. Once verified, the navbar will display **"Gemini AI Ready"** and all subsequent issue analyses will call the Gemini 2.5 Flash API with temperature-controlled structured JSON output.

### Local Explainable Fallback (Default / Offline)
- If no API key is provided, or if the device is offline, or if the API hits a network timeout or quota limit, CommunityPulse AI seamlessly runs its **Local Explainable Rules Engine**.
- The fallback evaluates the issue against transparent risk dictionaries (safety indicators, vulnerable population proximity, environmental severity, and duration persistence).
- The system **never crashes, never hangs, and never pretends a fallback is a Gemini response**.

---

## 7. Testing Instructions

Run the automated unit test suite with:
```bash
npm test
```

Run code quality and linter checks with:
```bash
npm run lint
```

The automated test suite verifies:
- Multi-factor priority score calculations across Critical, High, Medium, and Low scenarios.
- Duplicate detection sensitivity (threshold matching vs distinct report discrimination).
- Local AI decision support structured JSON validation.
- Storage CRUD operations (save, update, append resolution notes, delete, and dataset reset).

---

## 8. Data Storage & Production Architecture
Demo mode uses localStorage. localStorage is not shared across devices. For production, connect a secure shared backend such as Firebase or Supabase, enforce server-side authentication and authorization, and use a persistent database.

### Demo Authentication & Department Roles
- **Citizen Access:** Public access without authentication. Citizens can submit issues (`/report`), track status (`/track`), and view community issues (`/directory`) with zero login barriers.
- **Department Staff Portal (`/department` & `/department-login`):** Protected route for municipal crew coordination.
  - **Demo Credentials:** Staff ID: `STAFF-01` | Password: `admin123`
  - **Public Notes vs. Internal Notes:** Field staff can publish citizen-facing status updates (`publicNote`) while keeping operational logs, work order IDs, and police coordination strictly internal and confidential (`internalNotes`).
  - **Client Rate Limiting:** Enforces a 2-minute cooldown countdown between consecutive issue submissions per device to prevent automated spam.
  - **Standardized Ticket Format:** Collision-checked `CP-2026-XXXXX` identifiers.

---

## 9. Submission Compliance Verification
- **Repository Size:** Under 10 MB (Clean code repository, zero binary blobs or unneeded assets).
- **Branch Count:** Single `main` branch.
- **No Credentials:** Free of hardcoded secrets or API keys.

---



# CommunityPulse AI

Live: https://community-pulse-ai-cyan.vercel.app/


## How it works
- Citizen: No Login, big Report button, gets ID CP-2026-XXXXX
- Track: Only public data (ID, Status, Date, Public Note) - privacy safe
- Department: Login at /department-login, filters Pending/In Progress/Resolved
- Update: Public note for citizen + Internal note for staff
- AI: Auto category + Priority

## Run
npm install
npm run dev
npm run build -> success

*CommunityPulse AI — Empowering communities to report smarter, respond faster, and build better neighborhoods.*
