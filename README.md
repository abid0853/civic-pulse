<div align="center">
  <img src="https://img.shields.io/badge/Status-Deployed_on_GCP-success?style=for-the-badge&logo=googlecloud" alt="GCP Deployment" />
  <img src="https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-blue?style=for-the-badge&logo=google" alt="Gemini AI" />
  <h1>🌍 CivicPulse</h1>
  <p><strong>AI-Powered, Gamified Hyperlocal Infrastructure Maintenance</strong></p>
</div>

<br/>

> **Built with Google AI Studio: Core multi-agent reasoning and multimodal vision processing powered by the Gemini 2.5 Flash API.**

CivicPulse is a next-generation civic tech platform that turns city maintenance into a multiplayer, crowdsourced game. By leveraging cutting-edge Artificial Intelligence, real-time map synchronization, and gamification mechanics, CivicPulse empowers citizens to report, track, and verify repairs for public infrastructure—such as severe potholes, broken streetlights, and power grid failures.

## 🚀 Key Features

### 1. 🤖 AI-Powered Issue Triage
- **Automated Severity Scoring:** Users snap a photo of a civic issue. CivicPulse passes the image to the **Gemini 2.5 Flash API** to instantly analyze the hazard, determine its severity (Critical, High, Normal), and categorize it automatically.
- **Smart Bounties:** The AI dynamically assigns a "Bounty Reward" in Reputation Points (PTS) based on the danger level and effort required to fix it.

### 2. ⚡ Real-Time Power Grid Monitoring
- **Specialized Reporting:** Dedicated flow for tracking local Power Outages without requiring images.
- **Grid Alerts:** Power grid failures automatically trigger glowing "Alert Pins" on the community map and aggregate into live metrics. 

### 3. 🗺️ Live Community Heatmap
- **Interactive Mapping:** Powered by Leaflet, displaying live reports on a fully responsive, hyperlocal map.
- **Real-Time Feed:** Reports instantly stream to the community feed. As issues are resolved, the map dynamically updates.

### 4. 🎮 Gamified Civic Action
- **Reputation System:** Users earn points (PTS) by reporting issues and providing "Proof of Fix" photos.
- **Leaderboards & Analytics:** Citizens can track their impact, climb the local ranks, and unlock community badges.

### 5. 🛡️ Admin Verification Portal
- **Proof Validation:** When a "Civic Hacker" fixes an issue, they upload a proof image (automatically compressed client-side via HTML5 Canvas).
- **Admin Review:** Administrators review the before-and-after evidence and officially resolve the bounty, instantly crediting the user.

### 6. 📱 Progressive Web App (PWA)
- **Install Anywhere:** Includes a full Web App Manifest and custom glassmorphic install prompt allowing users to install CivicPulse natively on iOS and Android devices for quick access on the go.

---

## 🛠️ Technology Stack

- **Frontend:** [Next.js (App Router)](https://nextjs.org/) + React
- **Styling:** Tailwind CSS + Framer Motion (for fluid animations)
- **Database & Auth:** Google Firebase (Firestore + Firebase Auth)
- **AI Vision Model:** Gemini 2.5 Flash (via Google AI Studio)
- **Mapping:** React-Leaflet
- **Deployment & Cloud:** Google Cloud Platform (GCP)

---

## ☁️ Deployment on Google Cloud Platform (GCP)

This application is fully production-ready and configured for deployment on **Google Cloud Platform**. 

**Deployment Architecture:**
- **Hosting:** Deployed seamlessly using Google Cloud Run or App Engine.
- **Backend:** Data persistence and real-time sockets handled by Google Firebase (Firestore).
- **AI Processing:** Server-side API routes securely communicate with the Gemini API to prevent API key leakage.

---

## 💻 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/civic-pulse.git
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
