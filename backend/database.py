from pymongo import MongoClient
from config import DATABASE_URL
from models import Profile
from typing import List, Optional
from bson.objectid import ObjectId

class Database:
    def __init__(self):
        self.client = MongoClient(DATABASE_URL)
        self.db = self.client["slicer_profiles"]
        self.profiles_collection = self.db["profiles"]

    def insert_profile(self, profile: Profile) -> str:
        """Insert a new profile and return its ID"""
        profile_dict = profile.to_dict()
        result = self.profiles_collection.insert_one(profile_dict)
        return str(result.inserted_id)
    
    def get_all_profiles(self) -> List[dict]:
        """Get all profiles"""
        profiles = []
        for doc in self.profiles_collection.find():
            doc["id"] = str(doc["_id"])  # Convert MongoDB ID to string
            del doc["_id"]  # Remove the MongoDB internal ID
            profiles.append(doc)
        return profiles
    
    def get_profile_by_id(self, profile_id: str) -> Optional[dict]:
        """Get a specific profile by ID"""
        try:
            obj_id = ObjectId(profile_id)
            profile = self.profiles_collection.find_one({"_id": obj_id})
            if profile:
                profile["id"] = str(profile["_id"])
                del profile["_id"]
            return profile
        except:
            return None
    
db = Database()