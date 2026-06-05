# 3D PRINTER SLICER PROFILE HOSTING SERVICE:

A full-stack web platform for uploading, managing, sharing, comparing 3D printer slice profiles, along with previewing STL models in an interactive 3D viewer.

## FEATURES:

### AUTHENTICATION:
- User registration and login
- JWT-based authentication
- Protected routes (profiles are user-specific)
- Secure password hashing

### SLICER PROFILE MANAGEMENT:
- Upload `.ini` config files with metadata (name, printer type, description)
- Browse all your uploaded profiles
- Search/filter profiles by name, printer, or description
- View detailed profile information with full config content

### EDIT & VERSION CONTROL:
- Edit existing profiles (name, description, printer type)
- Replace configuration files
- Automatic version tracking on updates
- View version metadata on each profile

### PROFILE COMPARISON:
- Compare any two profiles side-by-side
- Visual diff highlighting (green=added, red=removed)
- Toggle between split-view and unified-view
- See version numbers for each compared profile

### 3D STL VIEWER:
- Upload `.stl` 3D model files
- Interactive 3D rendering with Three.js
- Orbit controls (rotate, pan, zoom)
- Auto-centering and camera positioning
- Phong-shaded materials with realistic lighting
- Download and delete STL files

### VISUAL DESIGN:

- Dark mode support
- Responsive layouts
- Clean Tailwind CSS styling
- Intuitive navigation

## ARCHITECTURE:
```mermaid
graph TB
    User[👤 User Browser]
    Frontend[Next.js Frontendlocalhost:3000]
    Backend[FastAPI Backendlocalhost:8000]
    MongoDB[(MongoDB AtlasCloud Database)]
    FileSystem[💾 File Systemuploads/stl/]
    
    User -->|HTTPS| Frontend
    Frontend -->|REST API + JWT| Backend
    Backend -->|PyMongo| MongoDB
    Backend -->|File I/O| FileSystem
    
    style Frontend fill:#0070f3,color:#fff
    style Backend fill:#009688,color:#fff
    style MongoDB fill:#13aa52,color:#fff
```

## DATABASE SCHEMATICS:
```mermaid
erDiagram
    USER ||--o{ PROFILE : owns
    USER {
        ObjectId _id
        string username UK
        string email UK
        string hashed_password
    }
    PROFILE {
        ObjectId _id
        string name
        string description
        string printer_type
        string config_content
        string file_name
        string owner FK
        int version
        string parent_id
        datetime updated_at
    }
```

## AUTHENTICATION FLOW:
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    
    U->>F: Enter username/password
    F->>B: POST /api/auth/login
    B->>DB: Validate credentials
    DB-->>B: User data
    B->>B: Generate JWT token
    B-->>F: Return JWT token
    F->>F: Store token in cookie
    
    Note over U,DB: Subsequent requests
    
    U->>F: Access protected page
    F->>B: GET /api/profiles + Bearer token
    B->>B: Validate JWT
    B->>DB: Query user's profiles
    DB-->>B: Profiles
    B-->>F: Return profiles
    F-->>U: Display profiles
```

## TECH STACK:

### BACKEND:
- **Python 3.11+** - Programming language
- **FastAPI** - Modern web framework
- **uvicorn** - ASGI server
- **PyMongo** - MongoDB driver
- **PyJWT** - JWT token handling
- **bcrypt/passlib** - Password hashing
- **python-multipart** - File upload handling

### FRONTEND:
- **Next.js 16** - React framework with Turbopack
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **Three.js** - 3D rendering library
- **react-diff-viewer-continued** - Diff visualization
- **js-cookie** - Cookie management

```mermaid
graph TB
    User[👤 User Browser]
    Frontend[Next.js Frontendlocalhost:3000]
    Backend[FastAPI Backendlocalhost:8000]
    MongoDB[(MongoDB AtlasCloud Database)]
    FileSystem[💾 File Systemuploads/stl/]
    
    User -->|HTTP| Frontend
    Frontend -->|REST API| Backend
    Backend -->|PyMongo| MongoDB
    Backend -->|Read/Write| FileSystem
```

### DATABASE:
- **MongoDB Atlas** - Cloud-hosted NoSQL database

## GETTING STARTED:

### PRE-REQUISITES:
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. CLONE THE REPOSITORY:
```bash
git clone https://github.com/acabada05/cs-35l-slice-profile-hosting.git
cd cs-35l-slice-profile-hosting
```

### 2. BACKEND SETUP:
```bash
cd backend

# CREATE VIRTUAL ENVIRONMENT:
python -m venv venv

# ACTIVATE VIRTUAL ENVIRONMENT:
# Windows (Git Bash):
source venv/Scripts/activate
# Mac/Linux:
source venv/bin/activate

# INSTALL DEPENDENCIES:
pip install -r requirements.txt
```

### 3. CONFIGURE ENVIRONMENT VARIABLES:
Create `backend/.env` file with:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/slicer_profiles?retryWrites=true&w=majority
SECRET_KEY=your-secret-key-for-jwt
```

### 4. START THE BACKEND:

```bash
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

### 5. FRONTEND SETUP:

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

## API ENDPOINTS:

### AUTHENTICATION:
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login (returns JWT) | No |

### PROFILES:
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| POST | `/api/profiles/upload` | Upload new profile | Yes |
| GET | `/api/profiles` | List user's profiles | Yes |
| GET | `/api/profiles/{id}` | Get specific profile | Yes |
| PUT | `/api/profiles/{id}` | Update profile | Yes |
| DELETE | `/api/profiles/{id}` | Delete profile | Yes |

### STL FILES:
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/stl/upload` | Upload STL file | Yes |
| GET | `/api/stl` | List all STL files | Yes |
| GET | `/api/stl/{filename}/download` | Download STL | Yes |
| DELETE | `/api/stl/{filename}` | Delete STL | Yes |

## APPLICATION PAGES:
| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | Login / Signup | No |
| `/upload` | Upload new profile | Yes |
| `/browse` | Browse profiles | Yes |
| `/profiles/[id]` | Profile details + edit | Yes |
| `/compare` | Compare two profiles | Yes |
| `/stl` | STL file management | Yes |
| `/stl/[id]` | 3D STL viewer | Yes |

## PROJECT STRUCTURE:
```
cs-35l-slice-profile-hosting/
├── backend/
│   ├── main.py              # FastAPI application & endpoints
│   ├── models.py            # Data models
│   ├── database.py          # MongoDB operations
│   ├── security.py          # Auth/JWT utilities
│   ├── config.py            # Configuration
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (gitignored)
│   ├── uploads/             # STL file storage (gitignored)
│   └── BACKEND_SETUP.md     # Backend setup guide
├── frontend/
│   ├── app/
│   │   ├── page.js          # Landing page
│   │   ├── layout.js        # Root layout with navbar
│   │   ├── login/           # Login page
│   │   ├── upload/          # Profile upload
│   │   ├── browse/          # Profile browse + search
│   │   ├── profiles/[id]/   # Profile detail + edit
│   │   ├── compare/         # Diff comparison
│   │   ├── stl/             # STL list page
│   │   ├── stl/[id]/        # 3D viewer
│   │   └── components/      # Reusable components
│   ├── lib/
│   │   ├── api.js           # API client
│   │   └── authContext.js   # Auth utilities
│   └── package.json         # Node dependencies
├── documents/               # Project documentation
└── README.md                # This file
```

## TEAM MEMBERS:
- Nathan Lintu
- Hannan Beiken
- Jinze Ye
- Abraham Cabada