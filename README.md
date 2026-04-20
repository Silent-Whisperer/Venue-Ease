# Venue-Ease 🏟️

A minimalist, high-performance stadium concierge dashboard. Built to help fans navigate massive venues without the chaos.

## The Problem
Stadiums are huge, confusing, and crowded. This project explores a streamlined UI to give fans exactly what they need: where they are, what's happening on the field, and a smart assistant to answer the quick questions like "Where's the nearest gate?"

## 🛠️ Built With
- **Angular 19** (Signals-driven state management)
- **Gemini 1.5 Flash** (Low-latency LLM for the concierge)
- **Tailwind CSS** (Clean, responsive layout)
- **Node/Express (SSR)** (Optimized for performance)

## 🚀 Quick Start

### 1. Requirements
- Node.js v20+
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Setup
```bash
# Install dependencies
npm install

# Setup your API key
cp src/environments/environment.ts.template src/environments/environment.ts
# Paste your key into the environment.ts file
```

### 3. Run it
```bash
npm run dev
```
Head over to `http://localhost:3000` and you're good to go.

## 📝 Features
- **Dashboard**: Live score tracking and venue heatmap (simulated).
- **Concierge**: A specialized AI assistant that stays on topic (stadium info only).
- **Onboarding**: Tailored experience based on your specific section and block.

## 📦 Deployment
The repo includes a `Dockerfile` ready for Google Cloud Run. 

---
*Note: This is a developer-focused prototype. The current AI assistant is configured for high reliability and concise text responses.*
