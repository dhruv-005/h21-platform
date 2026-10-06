<div align="center">

# 🚀 Shiftbase

### Bounded Schema Migration Assistant

**AI-Powered • Human-Gated • Deterministic • Reversible • Zero-Cost**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://your-vercel-url.vercel.app)
[![API Docs](https://img.shields.io/badge/📄_API_Docs-Swagger-85EA2D?style=for-the-badge&logo=fastapi)](https://your-render-url.onrender.com/docs)
[![Backend](https://img.shields.io/badge/⚙️_Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://your-render-url.onrender.com/api/health)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Test Scenarios](#-test-scenarios)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**Shiftbase** is an intelligent, secure, and fully reversible database schema migration assistant that automates the painful process of evolving database schemas from legacy structures to modern formats.

It combines **AI-driven semantic field mapping** with **strict deterministic code execution**, an **explicit human approval gate**, **in-memory dry-run simulations**, **quarantine error isolation**, and **one-click rollback safety** — all running on a **100% free infrastructure**.

> **Core Principle:** The AI *proposes*. The human *approves*. The engine *executes*. No AI ever touches the database directly.

---

## ⚠️ Problem Statement

When organizations update their database design (changing a Source Schema to a Target Schema), developers face:

- 🔴 **Manual field mapping** across hundreds of columns
- 🔴 **Data type mismatches** (e.g., string dates → ISO timestamps)
- 🔴 **Corrupted records** silently polluting the new database
- 🔴 **Accidental data loss** with no rollback mechanism
- 🔴 **No audit trail** of who approved what and when

**Shiftbase solves all five problems** in a single, cohesive pipeline.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Mapping** | Gemini AI + heuristic fallback engine proposes field mappings with confidence scores |
| 🔒 **Human Approval Gate** | No execution without explicit human sign-off and reviewer identity logging |
| ⚙️ **Deterministic Engine** | 12 bounded transformation rules executed via pure Python — no AI code generation |
| 🔬 **Dry-Run Simulation** | In-memory preview with side-by-side diff viewer before touching any database |
| 🛡️ **Quarantine Isolation** | Failed records diverted to holding area with granular error diagnostics |
| ↩️ **Instant Rollback** | One-click undo purges all migrated rows and restores pre-migration state |
| 📜 **Immutable Audit Trail** | Tamper-proof chronological log of every action, approval, and execution |
| 📊 **Count Verification** | Mathematical proof: `source_count == target_count + quarantine_count` |
| 🎨 **Spatial UI/UX** | "Built for Intelligent Performance" design system with glassmorphism and animations |
| 📱 **Fully Responsive** | Mobile, tablet, laptop, and ultra-wide desktop support |
| 🔐 **Cookie Sessions** | Secure signup/login with HTTP-only cookie-based session management |
| 💰 **100% Free** | Zero infrastructure cost — runs entirely on free tiers |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel Edge)                       │
│  React 18 + Vite + Tailwind CSS + "Intelligent Performance" UI  │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │  Schema  │ │Migration │ │ Dry Run  │ │   Audit Trail     │   │
│  │  Setup   │ │Plan Gate │ │ Results  │ │   Dashboard       │   │
│  └─────┬────┘ └─────┬────┘ └────┬─────┘ └───────┬───────────┘   │
└────────┼─────────────┼───────────┼───────────────┼──────────────┘
         │             │           │               │
    ─────▼─────────────▼───────────▼───────────────▼──────
              HTTPS + Cookie Sessions (CORS)
    ──────────────────────────────────────────────────────
         │             │           │               │
┌────────┼─────────────┼───────────┼───────────────┼──────────────┐
│        ▼             ▼           ▼               ▼              │
│                  BACKEND (Render Cloud)                         │
│  FastAPI + Uvicorn + Python 3.11                                │
│                                                                 │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────────┐     │
│  │ AI Agent   │ │ Plan Manager │ │  Migration Engine      │     │
│  │ (Gemini +  │ │ (Versioning  │ │  (Dry Run + Execute    │     │
│  │  Heuristic)│ │  + Approval) │ │   + Rollback)          │     │
│  └─────┬──────┘ └──────┬───────┘ └───────────┬────────────┘     │
│        │               │                     │                  │
│  ┌─────▼───────────────▼─────────────────────▼────────────┐     │
│  │          Deterministic Transformation Engine           │     │
│  │  split_string | format_date | to_integer | truncate ...│     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                     │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │              SQLite (WAL Mode) Database                │     │
│  │  ┌──────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │     │
│  │  │Plans │ │Quarantine│ │Mock Target│ │  Audit Log   │  │     │
│  │  └──────┘ └──────────┘ └───────────┘ └──────────────┘  │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Lucide Icons | Free |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 | Free |
| **Database** | SQLite 3 (WAL mode) via aiosqlite | Free |
| **AI Provider** | Google Gemini 1.5 Flash (Free Tier: 60 RPM) | Free |
| **AI Fallback** | Custom Heuristic Rule Engine (4-pass matching) | Free |
| **Hosting (FE)** | Vercel (Hobby Tier) | Free |
| **Hosting (BE)** | Render (Free Web Service) | Free |
| **Auth** | HTTP-only Cookie Sessions (SHA-256) | Free |
| **Total** | | **$0.00/month** |

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend Application** | [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app) |
| **Backend Health Check** | [https://your-render-url.onrender.com/api/health](https://your-render-url.onrender.com/api/health) |
| **Interactive API Docs** | [https://your-render-url.onrender.com/docs](https://your-render-url.onrender.com/docs) |

> ⚠️ **Note:** Render's free tier spins down after 15 min of inactivity. The first request may take ~30-40s to wake up.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/dhruv-005/Shiftbase.git
cd Shiftbase
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Linux/macOS
# .\venv\Scripts\Activate.ps1   # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Endpoints

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/api/health` | Health check (DB, AI, status) |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user (sets session cookie) |
| `POST` | `/api/auth/login` | Login (sets session cookie) |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/auth/me` | Verify current session |

### Schemas
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/schemas/validate` | Validate schema structure |
| `POST` | `/api/schemas/init` | Initialize migration workspace |

### Migration Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plans/{id}` | Fetch plan details |
| `POST` | `/api/plans/{id}/propose` | Generate AI mapping proposal |
| `PUT` | `/api/plans/{id}` | Human edits mappings (new version) |
| `POST` | `/api/plans/{id}/approve` | Human approval gate |
| `GET` | `/api/plans/{id}/history` | Version lineage tree |

### Execution
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/migration/{id}/dry-run` | In-memory simulation |
| `POST` | `/api/migration/{id}/execute` | Live migration (requires approval) |
| `POST` | `/api/migration/{id}/rollback` | Instant undo |
| `GET` | `/api/migration/{id}/target` | View migrated records |
| `GET` | `/api/migration/{id}/verify` | Count balance verification |

### Quarantine & Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quarantine/{id}` | View quarantined records |
| `GET` | `/api/audit` | Global audit trail |
| `GET` | `/api/audit/{id}` | Plan-specific audit trail |

---

## 🧪 Test Scenarios

### Scenario 1: Best Case (Products)
| Source | Target | Result |
|--------|--------|--------|
| `id, name, price` | `id, name, price_usd` | ✅ 2/2 migrated, 0 quarantined |

### Scenario 2: Medium Case (Employees)
| Source | Target | Result |
|--------|--------|--------|
| 8 fields with dates, salaries, bios | 9 fields with constraints | ✅ 4/6 migrated, 2 quarantined |

### Scenario 3: Worst Case (Orders → Transactions)
| Source | Target | Result |
|--------|--------|--------|
| 5 unrelated fields | 6 fields with enums | ❌ 0/5 migrated, 5 quarantined |

### Scenario 4: Stress Test (Multi-Transform)
| Source | Target | Result |
|--------|--------|--------|
| 10 records, 8 transform types | 9 fields with max_length | ✅ 4/10 migrated, 6 quarantined |

---

## 📁 Project Structure

```
Shiftbase/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Pydantic settings from .env
│   ├── requirements.txt           # Python dependencies
│   ├── database/
│   │   ├── connection.py          # Async SQLite (WAL mode)
│   │   ├── migrations.py          # DDL schema creation (8 tables)
│   │   └── repositories/          # Data access layer
│   │       ├── plan_repo.py
│   │       ├── source_repo.py
│   │       ├── target_repo.py
│   │       ├── quarantine_repo.py
│   │       ├── audit_repo.py
│   │       └── execution_repo.py
│   ├── models/                    # Pydantic v2 schemas
│   │   ├── schema.py
│   │   ├── plan.py
│   │   ├── execution.py
│   │   └── audit.py
│   ├── services/                  # Business logic
│   │   ├── ai_agent.py            # Gemini + Heuristic fallback
│   │   ├── plan_manager.py        # Versioning + approval
│   │   ├── transformation_engine.py  # 12 deterministic rules
│   │   ├── migration_engine.py    # Dry run + execute + rollback
│   │   ├── validator.py           # Schema & record validation
│   │   └── audit_service.py       # Immutable logging
│   ├── routes/                    # FastAPI endpoints
│   │   ├── auth_routes.py
│   │   ├── schema_routes.py
│   │   ├── plan_routes.py
│   │   ├── execution_routes.py
│   │   ├── quarantine_routes.py
│   │   └── audit_routes.py
│   ├── prompts/                   # AI prompt templates
│   │   └── mapping_prompt.py
│   └── tests/                     # Pytest test suite
├── frontend/
│   ├── index.html
│   ├── vercel.json                # SPA routing rewrites
│   ├── tailwind.config.js         # Custom theme tokens
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx               # Axios config + React entry
│       ├── App.jsx                # React Router setup
│       ├── index.css              # Complete design system
│       ├── theme/                 # 16 CSS/JS theme files
│       ├── components/
│       │   ├── theme/             # 11 visual components
│       │   ├── layout/            # AppShell, Sidebar, TopBar
│       │   ├── SchemaInput/       # Schema editors
│       │   ├── MigrationPlan/     # Proposal + approval
│       │   ├── Execution/         # Dry run + rollback
│       │   ├── Quarantine/        # Error isolation viewer
│       │   ├── Audit/             # Timeline ledger
│       │   └── common/            # Reusable UI components
│       ├── pages/                 # 7 route pages
│       └── hooks/                 # useMigration, useAuth, useAudit
├── data/                          # SQLite database storage
├── examples/                      # Sample schemas & records
├── render.yaml                    # Render deployment config
└── README.md                      # This file
```

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_CORS_ORIGINS=http://localhost:5173
DATABASE_PATH=/tmp/shiftbase.db
SECRET_KEY=your-secret-key-here
DEBUG=false
```

### Frontend (`.env.production`)
```env
VITE_API_URL=https://your-render-url.onrender.com
```

---

## 🚢 Deployment

### Backend → Render (Free)
1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect GitHub repo → Set **Root Directory** to `backend`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.production`
6. Click **Deploy**

### Frontend → Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Connect GitHub repo → Set **Root Directory** to `frontend`
3. **Framework:** Vite
4. Add `VITE_API_URL` = your Render URL
5. Click **Deploy**

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| **Hero Stage** | 3 animated spatial cards with SVG gauges and LED-dot metrics |
| **Login/Signup** | Video background with floating orbs and glassmorphism forms |
| **Schema Setup** | Dual JSON editors with live validation and template loading |
| **AI Proposal** | Mapping table with confidence scores and risk warnings |
| **Dry Run** | Side-by-side diff viewer with count verification |
| **Quarantine** | Error drill-down with raw source JSON inspection |
| **Audit Trail** | Chronological timeline with expandable payloads |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "feat: add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the Shiftbase**

**100% Free • Zero Data Loss • Bounded AI Execution**

</div>
