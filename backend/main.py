from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import jwt
import os

from pathlib import Path
from models import Profile
from database import db
from security import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM

app = FastAPI()

UPLOAD_DIR = Path("uploads/stl")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/api/stl/upload") 
async def upload_stl(file: UploadFile = File(...)):
    """Upload an STL file"""
    try:
        file_path = UPLOAD_DIR / file.filename
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        return {
            "status": "success",
            "message": "STL uploaded",
            "filename": file.filename,
            "size": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/stl")
async def list_stls():
    """List all uploaded STLs"""
    try:
        files = []
        for f in UPLOAD_DIR.iterdir():
            if f.is_file():
                files.append({
                    "file_id": f.name,
                    "original_name": f.name,
                    "size": f.stat().st_size
                })
        return {"files": files}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/stl/{file_id}/download")
async def download_stl(file_id: str):
    """Download an STL file"""
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / file_id
    if file_path.exists():
        return FileResponse(file_path, filename=file_id)
    raise HTTPException(status_code=404, detail="File not found")

@app.delete("/api/stl/{file_id}")
async def delete_stl(file_id: str):
    """Delete an STL file"""
    try:
        file_path = UPLOAD_DIR / file_id
        if file_path.exists():
            file_path.unlink()
            return {"status": "success", "message": "File deleted"}
        return {"status": "error", "message": "File not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/stl/{filename}")
async def get_stl(filename: str):
    """Get an STL file"""
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        return FileResponse(file_path)
    return {"status": "error", "message": "File not found"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Class for Authentication
class UserSignUp(BaseModel):
    username: str
    email: EmailStr
    password: str

# Require Authentication
def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validates the incoming JWT token and extracts user information"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        email: str = payload.get("email")
        if username is None:
            raise credentials_exception
        return {"username": username, "email": email}
    except jwt.PyJWTError:
        raise credentials_exception


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


# Auth API
@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignUp):
    if db.get_user_by_email(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.get_user_by_username(user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_pass = hash_password(user_data.password)
    new_user = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_pass
    }
    
    db.insert_user(new_user)
    return {"status": "success", "message": "User registered successfully"}


@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.get_user_by_username(form_data.username)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"], "email": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/profiles/upload")
async def upload_profile(
    file: UploadFile = File(...), 
    name: str = Form(""), 
    description: str = Form(""), 
    printer_type: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    # Upload a new profile linked to the logged-in user
    try:
        content = await file.read()
        config_text = content.decode("utf-8")
        
        profile = Profile(
            name=name or file.filename,
            description=description,
            printer_type=printer_type,
            config_content=config_text,
            file_name=file.filename
        )
        
        # Save the profile to the user's account
        profile_id = db.insert_profile(profile, owner=current_user["username"])
        
        return {
            "status": "success",
            "message": "Profile uploaded successfully",
            "profile_id": profile_id,
            "name": profile.name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/profiles")
def list_profiles(current_user: dict = Depends(get_current_user)):
    try:
        profiles = db.get_user_profiles(owner=current_user["username"])
        return {"profiles": profiles, "count": len(profiles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/profiles/{profile_id}")
def get_profile(profile_id: str, current_user: dict = Depends(get_current_user)):
    try:
        profile = db.get_profile_by_id_and_owner(profile_id, owner=current_user["username"])
        if profile:
            return {"profile": profile}
        else:
            # Masking access denial as a 404 keeps your database profile IDs anonymous
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/profiles/{profile_id}")
def delete_profile(profile_id: str, current_user: dict = Depends(get_current_user)):
    try:
        success = db.delete_profile_by_id_and_owner(profile_id, owner=current_user["username"])
        if not success:
            raise HTTPException(status_code=404, detail="Profile not found or unauthorized")
        return {"status": "success", "message": "Profile deleted successfully"}
    except HTTPException:
        raise
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
