# 🌍 EcoTrack AI — Carbon Footprint Awareness Platform

An AI-powered climate-tech SaaS platform that helps users calculate, monitor, visualize, and reduce their carbon emissions through intelligent recommendations, gamification, and predictive analytics.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Tailwind CSS, Framer Motion, Chart.js, Axios |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | MongoDB Atlas (via Motor async driver) |
| Auth | JWT (python-jose + passlib/bcrypt) |
| AI/ML | NumPy, Pandas, Scikit-learn |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
ecotrack-ai/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Navbar, StatCard, ProtectedRoute, etc.
│   │   ├── context/            # AuthContext (JWT state)
│   │   ├── pages/              # Landing, Login, Register, Dashboard, etc.
│   │   ├── layouts/            # AppLayout
│   │   ├── services/           # Axios API client
│   │   └── utils/              # Helpers, constants
│   ├── vercel.json
│   └── .env
│
└── server/                     # FastAPI backend
    ├── app/
    │   ├── config/             # Settings, MongoDB connection
    │   ├── models/             # Pydantic schemas
    │   ├── routes/             # auth, users, carbon, ai_coach, challenges, leaderboard
    │   ├── services/           # carbon_service, ai_service, gamification_service
    │   ├── middleware/         # JWT auth dependency
    │   ├── utils/              # JWT handler, password hashing
    │   └── main.py             # FastAPI app entry point
    ├── requirements.txt
    ├── render.yaml
    └── .env
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works)

---

### Backend Setup

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and add your MongoDB Atlas connection string and JWT secret
```

**`.env` configuration:**
```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ecotrack
DATABASE_NAME=ecotrack
JWT_SECRET_KEY=your-very-secure-random-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Configure environment
# Edit .env — set VITE_API_URL to your backend URL
```

**`.env`:**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

```bash
# Start dev server
npm run dev
```

Open: http://localhost:5173

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login + get JWT |
| GET | `/api/v1/users/me` | Get current user |
| PUT | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/stats` | User stats + badges |
| POST | `/api/v1/carbon/calculate` | Calculate footprint |
| POST | `/api/v1/carbon/activity` | Log activity |
| GET | `/api/v1/carbon/activities` | Activity history |
| GET | `/api/v1/carbon/analytics` | Dashboard analytics |
| POST | `/api/v1/ai/chat` | AI coach chat |
| GET | `/api/v1/ai/tips` | Daily eco tips |
| GET | `/api/v1/ai/insight` | Personalized insight |
| GET | `/api/v1/ai/predictions` | 12-month forecast |
| GET | `/api/v1/challenges/` | All challenges |
| POST | `/api/v1/challenges/join` | Join challenge |
| POST | `/api/v1/challenges/complete` | Complete challenge |
| GET | `/api/v1/leaderboard/` | Global leaderboard |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push `client/` folder to GitHub
2. Connect repo to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api/v1`
4. Deploy — Vercel auto-detects Vite

### Backend → Render

1. Push `server/` folder to GitHub
2. Create new Render Web Service
3. Set environment variables (MONGODB_URL, JWT_SECRET_KEY, FRONTEND_URL)
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create database user + get connection string
3. Whitelist `0.0.0.0/0` for IP access (or specific IPs)
4. Paste connection string into server `.env`

---

## ✨ Features

- 🌱 **Carbon Footprint Calculator** — 5-category detailed calculator (transport, energy, food, shopping, lifestyle) using IPCC emission factors
- 🤖 **AI Sustainability Coach** — Intelligent chat assistant with personalized advice
- 📈 **Predictive Analytics** — ML-based 12-month emission forecasting
- 📊 **Interactive Charts** — Bar, line, doughnut charts with real user data
- 🏆 **Gamification** — XP system, eco streaks, 8 achievement badges, 4 eco levels
- 🌿 **Eco Challenges** — 10 real sustainability challenges with XP rewards
- 🌍 **Global Leaderboard** — Sortable by XP, streak, CO₂ saved
- 👤 **Profile System** — Editable profile with avatar, bio, location
- 🔒 **JWT Auth** — Secure authentication with bcrypt password hashing
- 📱 **Responsive** — Mobile-first design, works on all devices
- 🎨 **Premium UI** — Dark eco-tech glassmorphism aesthetic

---

## 🏆 Hackathon Notes

This project demonstrates:
- Clean, modular full-stack architecture
- Real emission factors from IPCC/EPA
- Production-ready security (JWT, bcrypt, input validation, CORS)
- Deployment-ready configuration (Vercel + Render)
- Genuine AI/ML integration (NumPy, Pandas predictions)
- Beautiful, animated UI with Framer Motion

---

*Built with 💚 for a sustainable future*
