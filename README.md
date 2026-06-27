<div align="center">
  <img src="https://img.shields.io/badge/Status-Deployed_on_GCP-success?style=for-the-badge&logo=googlecloud" alt="GCP Deployment" />
  <img src="https://img.shields.io/badge/Powered_by-Gemini_1.5_Flash-blue?style=for-the-badge&logo=google" alt="Gemini AI" />
  <h1>🌍 CivicPulse</h1>
  <p><strong>AI-Powered, Gamified Hyperlocal Infrastructure Maintenance</strong></p>
  <p>
    <a href="https://civic-pulse-ai-599413267864.asia-south1.run.app/" target="_blank"><strong>🔴 View Live Demo</strong></a> | 
    <a href="https://github.com/abid0853/civic-pulse" target="_blank"><strong>🐙 GitHub Repository</strong></a>
  </p>
</div>

<br/>

> **Built with Google AI Studio: Core multi-agent reasoning and multimodal vision processing powered by the Gemini API.**

CivicPulse is a next-generation civic tech platform that turns city maintenance into a multiplayer, crowdsourced game. By leveraging cutting-edge Artificial Intelligence, real-time map synchronization, and gamification mechanics, CivicPulse empowers citizens to report, track, and verify repairs for public infrastructure—ranging from unannounced power cuts and deep potholes, to critical emergencies like water flooding due to ruptured pipes, roads blocked by landslides, and dangerously unstable buildings.

---

## 🚀 Key Features

### 1. 🤖 AI-Powered Issue Triage
* **Automated Severity Scoring:** Users snap a photo of a civic hazard. CivicPulse passes the image to the Google Gemini AI to instantly analyze the context, determine its severity (Critical, High, Normal), and categorize it automatically.
* **Broad Scope Reporting:** Citizens can report power cuts, road degradation, severe waste mismanagement, flooding, landslide blockages, and structural building threats.

### 2. 🎯 Admin Triage & Bounties
* **Command Center:** Municipal admins review pending AI-analyzed reports on a dedicated dashboard.
* **Smart Bounties:** Once verified, admins approve the issue and manually assign a "Bounty" in Reputation Points (PTS) based on the effort required to fix it, converting the report into an Active Task.
* **User Management:** Admins monitor community engagement and can manually promote users to higher badge tiers.

### 3. 🛠️ Do & Earn Task Board (Gamified Resolution)
* **Gig-Economy Mechanics:** Approved bounties appear on a public marketplace board.
* **Proof of Work:** Citizens or local contractors can claim active tasks, physically resolve the issue, and upload "After" photos directly to the platform as proof of their work.
* **Digital Rewards:** Upon successful submission, users instantly receive a pop-up Task Completion Certificate detailing their earned rewards.

### 4. 🏆 Gamification & Leaderboards
* **Reputation System:** Every action has value. Users earn points (PTS) for both reporting accurate issues and successfully completing bounties.
* **Dynamic Badges:** As users accumulate points, admins can award them Silver, Gold, and Elite badges for their community impact.
* **Global Leaderboard:** A real-time, competitive leaderboard ranks all citizens in the city by their total points, motivating continuous engagement.

### 5. 🗺️ Live Community Heatmap & Grid Monitoring
* **Interactive Mapping:** Powered by Leaflet, displaying live reports on a fully responsive, hyperlocal map.
* **Grid Alerts:** Power grid failures automatically trigger glowing "Alert Pins" on the community map and aggregate into live metrics.

### 6. 📱 Progressive Web App (PWA)
* **Install Anywhere:** Includes a full Web App Manifest and custom install prompt allowing users to install CivicPulse natively on iOS and Android devices for quick access on the go.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16 (App Router), React, Tailwind CSS, Framer Motion
* **Database & Auth:** Google Firebase (Firestore NoSQL + Firebase Auth)
* **AI Vision Model:** Google Gemini 1.5 API
* **Mapping:** Leaflet.js / React-Leaflet
* **Deployment & Cloud:** Docker, Google Cloud Run, Google Cloud Build

---

## ☁️ Deployment on Google Cloud Platform (GCP)

This application is fully containerized and configured for auto-scaling deployment on Google Cloud.

### Deployment Architecture:
* **Containerization:** A Dockerfile ensures exact environment consistency.
* **Hosting:** Deployed seamlessly using Google Cloud Run for serverless, scale-to-zero performance.
* **CI/CD:** Google Cloud Build handles Continuous Integration and Deployment, pushing updates directly from the GitHub repository.
* **Backend:** Data persistence handled by Firebase (Firestore) with secure role-based access rules.

---



## 💻 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/abid0853/civic-pulse.git
   cd civic-pulse
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Google Gemini and Firebase credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here

   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.
