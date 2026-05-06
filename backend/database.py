from pymongo import MongoClient
from config import DATABASE_URL
from models import Profile
from typing import List, Optional

class Database:
    def __init__(self):
        self.client = MongoClient(DATABASE_URL)
        self.db = self.client["slicer_profiles"]
        self.profiles_collection = self.db["profiles"]

    def insert_profiles(self, profile: Profile) -> str:
        """Insert a new profile and return its ID"""
        result = self.profiles_collection.insert_one(profile.to_dict())
        return str(result.inserted_id)
    
    def get_all_profiles(self) -> List[dict]:
        """Get all profiles"""
        profiles = list(self.profiles_collection.find({}, {"_id": 0}))
        return profiles
    
    def get_profile_by_id(self, profile_id: str) -> Optional[dict]:
        """Get a specific profile by ID"""
        profile = self.profiles_collection.find_one({"id": profile_id}, {"_id": 0})
        return profile
    
db = Database()