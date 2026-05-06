import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017/slicer_profiles")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")