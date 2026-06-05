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
        self.stl_collection = self.db["stl_files"]

    def insert_profile(self, profile: Profile, owner: str) -> str:
        profile_dict = profile.to_dict()
        profile_dict["owner"] = owner
        result = self.profiles_collection.insert_one(profile_dict)
        return str(result.inserted_id)

    def get_user_profiles(self, owner: str) -> List[dict]:
        profiles = []
        for doc in self.profiles_collection.find({"owner": owner}):
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            profiles.append(doc)
        return profiles

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

    def delete_profile_by_id_and_owner(self, profile_id: str, owner: str) -> bool:
        try:
            obj_id = ObjectId(profile_id)
            result = self.profiles_collection.delete_one({"_id": obj_id, "owner": owner})
            return result.deleted_count > 0
        except Exception:
            return False

    def insert_stl(self, record: dict) -> str:
        result = self.stl_collection.insert_one(record)
        return str(result.inserted_id)

    def get_stl_files_by_owner(self, owner: str) -> List[dict]:
        files = []
        for doc in self.stl_collection.find({"owner": owner}):
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            files.append(doc)
        return files

    def get_stl_by_id_and_owner(self, file_id: str, owner: str) -> Optional[dict]:
        try:
            doc = self.stl_collection.find_one({"file_id": file_id, "owner": owner})
            if doc:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
            return doc
        except Exception:
            return None

    def delete_stl_by_id_and_owner(self, file_id: str, owner: str) -> bool:
        try:
            result = self.stl_collection.delete_one({"file_id": file_id, "owner": owner})
            return result.deleted_count > 0
        except Exception:
            return False

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

    def update_profile_by_id_and_owner(self, profile_id: str, owner: str, fields: dict) -> Optional[dict]:
        try:
            obj_id = ObjectId(profile_id)
            result = self.profiles_collection.update_one(
                {"_id": obj_id, "owner": owner},
                {"$set": fields}
            )
            if result.matched_count == 0:
                return None
            # Re-fetch and normalize _id -> id, same as get_profile_by_id_and_owner
            updated = self.profiles_collection.find_one({"_id": obj_id, "owner": owner})
            if updated:
                updated["id"] = str(updated["_id"])
                del updated["_id"]
            return updated
        except Exception:
            return None


db = Database()