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
        self.users_collection = self.db["users"]

    # Upload profile for user
    def insert_profile(self, profile: Profile, owner: str) -> str:
        """Insert a new profile linked to an owner and return its ID"""
        profile_dict = profile.to_dict()
        profile_dict["owner"] = owner  # Link the profile to the logged-in user
        result = self.profiles_collection.insert_one(profile_dict)
        return str(result.inserted_id)
    
    # Get all profiles owned by user
    def get_user_profiles(self, owner: str) -> List[dict]:
        profiles = []
        for doc in self.profiles_collection.find({"owner": owner}):
            doc["id"] = str(doc["_id"])  # Convert MongoDB ID to string
            del doc["_id"]  # Remove the MongoDB internal ID
            profiles.append(doc)
        return profiles
    
    # Fetch a specific profile only if the user owns it.
    def get_profile_by_id_and_owner(self, profile_id: str, owner: str) -> Optional[dict]:
        try:
            obj_id = ObjectId(profile_id)
            profile = self.profiles_collection.find_one({"_id": obj_id, "owner": owner})
            if profile:
                profile["id"] = str(profile["_id"])
                del profile["_id"]
            return profile
        except:
            return None

    # Deletes a profile belonging to user. Returns True if deleted.
    def delete_profile_by_id_and_owner(self, profile_id: str, owner: str) -> bool:
        try:
            obj_id = ObjectId(profile_id)
            result = self.profiles_collection.delete_one({"_id": obj_id, "owner": owner})
            return result.deleted_count > 0
        except Exception:
            return False
            
    # Auth Methods
    def insert_user(self, user_dict: dict) -> str:
        result = self.users_collection.insert_one(user_dict)
        return str(result.inserted_id)

    def get_user_by_username(self, username: str) -> Optional[dict]:
        user = self.users_collection.find_one({"username": username})
        if user:
            user["id"] = str(user["_id"])
            del user["_id"]
        return user

    def get_user_by_email(self, email: str) -> Optional[dict]:
        user = self.users_collection.find_one({"email": email})
        if user:
            user["id"] = str(user["_id"])
            del user["_id"]
        return user
    
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
