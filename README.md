# 3D Printer Slice Profile Hosting Service

A web-based platofrm for uploading, managing, sharing, and comparing 3D printer slicer profiles.

## Project Overview

Users can upload, view, edit, and compare slicer configuarions for different 3D printers. The platform provides an integrated 3D STL viewer, config editor, and diff viewer.

## Tech Stack

**Backend:**
- Python FastAPI
- MongoDB
- uvicorn

**Frontend:**
- React / Next.js
- Three.js (3D Viewer)

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
TBD

## API Endpoints

### Profiles
- `GET /api/health` - Health check
- `POST /api/profiles/upload` - Upload a new profile
- `GET /api/profiles` - List all profiles
- `GET /api/profiles/{id}` - Get a specific profile

## Team Members
- Nathan Lintu
- Hannan Beiken
- Jinze Ye
- Abraham Cabada

## Deadline
- Target: May 31, 2026
- Hard Deadline: June 5, 2026