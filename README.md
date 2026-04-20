# VenueFlow AI - Stadium Concierge

VenueFlow AI is a high-performance stadium concierge application designed to provide personalized assistance to stadium attendees. This version is powered by **Gemini 1.5 Flash** for fast, reliable text-based interactions.

## Features
- **Premium UI**: Sleek, modern dashboard with real-time stadium insights.
- **AI Concierge**: High-speed conversational assistant for stadium info.
- **Onboarding Flow**: Tailored experience based on stadium and section selection.
- **GitHub Ready**: Clean structure with environment-based configuration.

## Getting Started

### Prerequisites
- Node.js (v20+)
- Angular CLI

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd VFAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Locate `src/environments/environment.ts.template`.
   - Create a copy named `src/environments/environment.ts`.
   - Add your [Gemini API Key](https://aistudio.google.com/app/apikey) to the `geminiApiKey` field.

### Development Server

Run the development server on port 3000:
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

## Deployment
This project is container-ready and includes a `Dockerfile` for easy deployment to Google Cloud Run or similar platforms.

---
Built with ❤️ for stadium fans everywhere.
