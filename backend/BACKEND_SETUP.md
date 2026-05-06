# Backend Setup Guide

## Prerequisites

- Python 3.8+
- MongoDB (running locally or via Atlas)

## Installation

### 1. Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal.

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Environment Variables

Create/update `.env` file:
DATABASE_URL=mongodb://localhost:27017/slicer_profiles
SECRET_KEY=your-secret-key-here

### 4. Start MongoDB

MongoDB must be running before starting the backend.

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create an account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Update `DATABASE_URL` in `.env` with your connection string

### 5. Run the Backend

```bash
uvicorn main:app --reload
```

You should see:
INFO:     Uvicorn running on http://127.0.0.1:8000

## Testing Endpoints

### Health Check
```bash
curl http://localhost:8000/api/health
```

### List Profiles
```bash
curl http://localhost:8000/api/profiles
```

### Get Specific Profile
```bash
curl http://localhost:8000/api/profiles/{profile_id}
```

### Upload Profile (requires multipart form data)
Use Postman or similar tool to POST to `/api/profiles/upload`

## Project Structure
backend/
├── main.py          # FastAPI app and route definitions
├── models.py        # Profile data structure
├── database.py      # MongoDB operations
├── config.py        # Load environment variables
├── .env             # Secret configuration (not in git)
├── .gitignore       # Git ignore rules
├── requirements.txt # Python dependencies
└── BACKEND_SETUP.md # This file

## Troubleshooting

**"uvicorn: command not found"**
- Make sure virtual environment is activated: `(venv)` should show at terminal start

**"No connection could be made...localhost:27017"**
- MongoDB is not running. Start it with `mongod` or connect to MongoDB Atlas

**"Form data requires python-multipart"**
- Install missing dependency: `pip install python-multipart`

## Next Steps

- Implement 3D STL viewer
- Implement config editor
- Implement diff viewer