from datetime import datetime

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
    
    def update_profile(self, profile_id, profile):
        """Update an existing profile and create a new version"""
        from bson.objectid import ObjectId
        
        # Increment version nuber
        existing = self.db.profiles.find_one({"_id": ObjectId(profile_id)})
        version = (existing.get("version", 0) if existing else 0) + 1

        #Store with version metadata
        profile_data = profile.to_dict()
        profile_data["version"] = version
        profile_data["parent_id"] = profile_id  # Link to original profile
        profile_data["updated_at"] = datetime.utcnow()
        
        result = self.profiles_collection.update_one(
            {"_id": ObjectId(profile_id)},
            {"$set": profile_data}
        )
        return profile_id
    
    def _format_profile(self, profile_doc):
        """Format a profile document for API response"""
        if profile_doc:
            profile_doc["id"] = str(profile_doc["_id"])
            del profile_doc["_id"]
        return profile_doc

    def get_profile_versions(self, profile_id):
        """Get all versions of a profile"""
        from bson.objectid import ObjectId
        
        versions = list(self.profiles_collection.find({
            "$or": [
                {"_id": ObjectId(profile_id)},
                {"parent_id": profile_id}
            ]
        }).sort("version", -1))

        return [self._format_profile(v) for v in versions]
db = Database()