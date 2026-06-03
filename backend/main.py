from fastapi import FastAPI, UploadFile, File, Form
from models import Profile
from database import db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.post("/api/profiles/upload")
async def upload_profile(
    file: UploadFile = File(...), 
    name: str = Form(""), 
    description: str = Form(""), 
    printer_type: str = Form("")
):
    """Upload a new slicer profile"""
    try:
        # Read file content
        content = await file.read()
        config_text = content.decode("utf-8")
        
        # Create a profile object
        profile = Profile(
            name=name or file.filename,
            description=description,
            printer_type=printer_type,
            config_content=config_text,
            file_name=file.filename
        )
        
        # Save to database
        profile_id = db.insert_profile(profile)
        
        return {
            "status": "success",
            "message": "Profile uploaded successfully",
            "profile_id": profile_id,
            "name": profile.name
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/profiles")
def list_profiles():
    """Get all profiles"""
    try:
        profiles = db.get_all_profiles()
        return {"profiles": profiles, "count": len(profiles)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/profiles/{profile_id}")
def get_profile(profile_id: str):
    """Get a specific profile by ID"""
    try:
        profile = db.get_profile_by_id(profile_id)
        if profile:
            return {"profile": profile}
        else:
            return {"status": "error", "message": "Profile not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
#Frontend Endpoint to Update an Existing Profile.
#Creates backend API endpoint frontend calls to update an existing profile.
@app.put("/api/profiles/{profile_id}")
async def update_profile(
    profile_id: str,
    file: UploadFile = File(...),
    name: str = Form(""),
    description: str = Form(""),
    printer_type: str = Form("")
):
    """Update an existing profile (creates a new version)"""
    try:
        content = await file.read()
        config_text = content.decode("utf-8")

        profile = Profile(
            name=name,
            description=description,
            printer_type=printer_type,
            config_content=config_text,
            file_name=file.filename
        )

        result = db.update_profile(profile_id, profile)
        return {"status": "success", "message": "Profile updated", "profile_id": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}