# FairSight AI – Bias-Aware Decision Auditor
Bringing transparency and fairness to AI-driven decisions

A hackathon-ready full-stack web application designed to analyze resource allocation decisions, detect biases, and generate fairness audits using Gemma 4 (via OpenRouter). 

## 📁 Project Structure

- `client/`: React frontend (Vite + Tailwind CSS)
- `server/`: Node.js backend (Express + Axios)

## 🚀 Setup Instructions

### 1. Backend (Server)
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your **OpenRouter API Key** (or standard OpenAI-compatible API key for Gemma 4).
5. Start the server:
   ```bash
   npm run dev
   ```
   *The server runs on http://localhost:3001*

### 2. Frontend (Client)
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The client runs on http://localhost:5173*

## ☁️ Deployment Guide

### Deploying Backend to Google Cloud Run
The `server/` directory contains a `Dockerfile` ready for deployment.
1. Build and submit the container to Google Cloud:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/fairsight-server
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy fairsight-server \
     --image gcr.io/YOUR_PROJECT_ID/fairsight-server \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars OPENROUTER_API_KEY=your_key_here
   ```

### Deploying Frontend to Firebase Hosting
1. Build the production application:
   ```bash
   cd client
   npm run build
   ```
2. Initialize Firebase (if not already done):
   ```bash
   firebase init hosting
   ```
   *(Select the `dist` directory as the public directory, configure as a single-page app)*
3. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## 🧠 Core Features
- **Analyze**: Calculate a resource allocation priority score.
- **Fairness Audit**: The AI evaluates the score for region/income bias.
- **Fix Bias**: Adjusts the formula weight and re-evaluates automatically.
- **Ask AI**: A direct conversational interface to interrogate the decision.
"# FairSight-" 
"# FairSight-" 
