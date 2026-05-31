# 3D Printer Slicer Profile Hosting Service

A web-based platform for uploading, managing, sharing, and comparing 3D printer slicer profiles.

## Project Overview

Users can upload, view, edit, and compare slicer configurations for different 3D printers. The platform provides an integrated 3D STL viewer, config editor, and diff viewer.

## Tech Stack

**Backend:**
- Python FastAPI
- MongoDB
- uvicorn

**Frontend:**
- React / Next.js
- Tailwind CSS
- react-diff-viewer-continued
- Three.js (3D Viewer — planned)

## Project Structure
cs-35l-slice-profile-hosting/
├── backend/          # FastAPI backend
│   ├── main.py       # Main app and endpoints
│   ├── models.py     # Data models
│   ├── database.py   # Database operations
│   ├── config.py     # Configuration
│   ├── .env          # Environment variables
│   └── requirements.txt
├── frontend/         # React/Next.js frontend
├── documents/        # Project documentation
└── README.md

## Getting Started

### Backend Setup
See [BACKEND_SETUP.md](./backend/BACKEND_SETUP.md) for detailed backend setup instructions.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). The backend must be running at `http://localhost:8000` for API calls to work.

## API Endpoints

### Profiles
- `GET /api/health` - Health check
- `POST /api/profiles/upload` - Upload a new profile
- `GET /api/profiles` - List all profiles
- `GET /api/profiles/{id}` - Get a specific profile

## Pages
- `/` — Landing page
- `/upload` — Upload a new slicer profile
- `/browse` — Browse all hosted profiles
- `/profiles/[id]` — View a single profile with its configuration content
- `/compare` — Compare two profiles side-by-side with diff highlighting

## Team Members
- Nathan Lintu
- Hannan Beiken
- Jinze Ye
- Abraham Cabada

## Deadline
- Target: May 31, 2026
- Hard Deadline: June 5, 2026