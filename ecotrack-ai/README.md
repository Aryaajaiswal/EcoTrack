# 🌿 EcoTrack AI

> **AI-Powered Carbon Footprint Awareness Platform**  
> A full-stack climate-tech SaaS application for tracking, measuring, and reducing personal carbon emissions.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com/)

---

## 🚀 Live Demo

- **Frontend**: [https://ecotrack-ai.vercel.app](https://ecotrack-ai.vercel.app)
- **API Docs**: [https://ecotrack-api.onrender.com/docs](https://ecotrack-api.onrender.com/docs)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧮 **Carbon Calculator** | 5-step calculator using real IPCC emission factors across transport, energy, food, shopping & lifestyle |
| 🤖 **AI Coach** | Intelligent chat assistant with personalized recommendations and eco tips |
| 📈 **Predictive Analytics** | ML-powered 12-month emission forecasting with trend analysis |
| 🏆 **Gamification** | XP system, eco streaks, achievement badges, and eco level progression |
| 🌿 **Eco Challenges** | 10 real-world sustainability missions with CO₂ savings tracking |
| 🌍 **Global Leaderboard** | Ranked competitive leaderboard sortable by XP, streak, or CO₂ saved |
| 👤 **Profile System** | Customizable profiles with stats, badges, and level progress |
| 🔐 **JWT Auth** | Secure registration, login, password hashing with bcrypt |
| 📊 **Analytics Dashboard** | Interactive charts for daily/weekly emissions and category breakdowns |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS v4** — utility styling
- **Framer Motion** — animations & page transitions
- **Chart.js / react-chartjs-2** — analytics charts
- **Lucide React** — icon library
- **React Hot Toast** — notifications
- **React Router DOM v7** — client-side routing
- **Axios** — HTTP client

### Backend
- **Python** + **FastAPI** — async REST API
- **Uvicorn** — ASGI server
- **Motor** (async MongoDB driver) + **PyMongo**
- **Python-JOSE** — JWT authentication
- **Passlib + bcrypt** — password hashing
- **Pydantic v2** — data validation
- **NumPy + scikit-learn** — ML predictions
- **python-dotenv** — environment config

### Infrastructure
- **MongoDB Atlas** — cloud database
- **Vercel** — frontend deployment
- **Render** — backend deployment

---

## 📁 Project Structure

```
ecotrack-ai/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ParticleBackground.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── Landing.jsx     # Marketing page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── Calculator.jsx  # Carbon calculator
│   │   │   ├── AICoach.jsx     # AI chatbot + predictions
│   │   │   ├── Analytics.jsx   # Advanced analytics
│   │   │   ├── Challenges.jsx  # Eco challenges
│   │   │   ├── Leaderboard.jsx # Global rankings
│   │   │   └── Profile.jsx     # User profile
│   │   ├── context/            # React context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useAnimations.js
│   │   ├── layouts/            # Page layouts
│   │   │   └── AppLayout.jsx
│   │   ├── services/           # API services
│   │   │   └── api.js
│   │   ├── utils/              # Utilities
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Global styles + design system
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json       # PWA manifest
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── server/                     # FastAPI backend
    ├── app/
    │   ├── config/
    │   │   ├── database.py     # MongoDB connection
    │   │   └── settings.py     # Pydantic settings
    │   ├── middleware/
    │   │   └── auth.py         # JWT authentication middleware
    │   ├── models/
    │   │   ├── user.py         # User Pydantic models
    │   │   ├── carbon.py       # Carbon calculation models
    │   │   └── challenge.py    # Challenge models
    │   ├── routes/
    │   │   ├── auth.py         # /auth/* endpoints
    │   │   ├── users.py        # /users/* endpoints
    │   │   ├── carbon.py       # /carbon/* endpoints
    │   │   ├── ai_coach.py     # /ai/* endpoints
    │   │   ├── challenges.py   # /challenges/* endpoints
    │   │   └── leaderboard.py  # /leaderboard/* endpoints
    │   ├── services/
    │   │   ├── carbon_service.py      # IPCC emission calculations
    │   │   ├── ai_service.py          # AI recommendations & ML predictions
    │   │   └── gamification_service.py # XP, badges, challenges
    │   ├── utils/
    │   │   ├── jwt_handler.py
    │   │   └── password.py
    │   └── main.py             # FastAPI app entry point
    ├── requirements.txt
    ├── render.yaml             # Render deployment config
    └── .env                    # Environment variables
```

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB Atlas account (free tier works)

### 1. Clone and setup

```bash
git clone https://github.com/yourusername/ecotrack-ai.git
cd ecotrack-ai
```

### 2. Frontend Setup

```bash
cd client
npm install
cp .env.example .env      # Set VITE_API_URL=http://localhost:8000/api/v1
npm run dev               # Runs on http://localhost:5173
```

### 3. Backend Setup

```bash
cd server
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
cp .env.example .env       # Configure MongoDB URL and JWT secret
uvicorn app.main:app --reload --port 8000
```

### 4. Configure Environment

**server/.env:**
```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecotrack
DATABASE_NAME=ecotrack
JWT_SECRET_KEY=your-super-secret-key-minimum-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
```

**client/.env:**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login and get JWT |
| `GET` | `/api/v1/users/me` | Get current user profile |
| `PUT` | `/api/v1/users/me` | Update user profile |
| `GET` | `/api/v1/users/stats` | Get detailed user statistics |
| `POST` | `/api/v1/carbon/calculate` | Calculate carbon footprint |
| `POST` | `/api/v1/carbon/activity` | Log a carbon activity |
| `GET` | `/api/v1/carbon/activities` | Get activity history |
| `GET` | `/api/v1/carbon/analytics` | Get analytics data |
| `POST` | `/api/v1/ai/chat` | Chat with AI coach |
| `GET` | `/api/v1/ai/tips` | Get daily eco tips |
| `GET` | `/api/v1/ai/insight` | Get personalized insight |
| `GET` | `/api/v1/ai/predictions` | Get 12-month predictions |
| `GET` | `/api/v1/ai/forecast` | Get 7-day forecast |
| `GET` | `/api/v1/challenges/` | List all challenges |
| `POST` | `/api/v1/challenges/join` | Join a challenge |
| `POST` | `/api/v1/challenges/complete` | Complete a challenge |
| `GET` | `/api/v1/leaderboard/` | Get global leaderboard |

Full interactive docs available at `/docs` (Swagger UI) when backend is running.

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy to Vercel via CLI or GitHub integration
vercel --prod
```

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables
4. Deploy from `server/render.yaml`

---

## 🏆 Gamification System

| Level | XP Required | Icon |
|-------|-------------|------|
| Eco Beginner | 0+ | 🌱 |
| Aware Citizen | 200+ | 🌿 |
| Green Warrior | 500+ | ⚔️ |
| Climate Hero | 1500+ | 🦸 |

**XP Rewards:**
- Carbon calculation: +50 XP
- Log activity: +15 XP
- Complete challenge (easy): +75 XP
- Complete challenge (medium): +150 XP
- Complete challenge (hard): +300 XP
- 7-day streak bonus: +100 XP

---

## 📊 Carbon Calculation Methodology

Emission factors from IPCC AR6, EPA, and UK DEFRA guidelines:
- **Transportation**: 0.05–0.21 kg CO₂/km by vehicle type
- **Flights**: 255 kg (domestic) to 990 kg (international) per trip
- **Home Energy**: 0.475 kg CO₂/kWh grid electricity
- **Food**: 1,500–3,300 kg CO₂/year by diet type
- **Shopping**: Based on clothing, online orders, plastic use

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

## 🌍 Contributing

PRs welcome! Please read our contributing guidelines and code of conduct.

---

*Built with 💚 for a greener future. EcoTrack AI — © 2026*
