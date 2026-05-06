from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
def health_check():
        return {"status": "ok", "message": "Backend is running!"}

# The following are endpoints:

@app.post("/api/profiles/upload")
def upload_profile():
            return {"message": "Profile upload edpoint, not implemented as of yet"}

@app.get("/api/profiles")
def list_profiles():
            return {"profiles": []}

@app.get("/api/profiles/{profile_id}")
def get_profile(profile_id: str):
        return {"profile_id": profile_id, "message": "Profile detail endpoint, not implemented as of yet"}