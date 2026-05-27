from datetime import datetime
from typing import Optional

class Profile:
    def __init__(self, name: str, description: str, printer_type: str, 
                 config_content: str, file_name: str, id: Optional[str] = None):
        self.id = id
        self.name = name
        self.description = description
        self.printer_type = printer_type
        self.config_content = config_content
        self.file_name = file_name
        self.uploaded_date = datetime.now().isoformat()

    def to_dict(self):
        """Convert profile to dictionary for database storage"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "printer_type": self.printer_type,            
            "config_content": self.config_content,
            "file_name": self.file_name,
            "uploaded_date": self.uploaded_date
    }
        