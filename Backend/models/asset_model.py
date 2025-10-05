from pydantic import BaseModel
from typing import List, Optional
from .user_model import User
from datetime import datetime

class Asset(BaseModel):
    user: User
    asset_name: str
    asset_type: str
    value: float
    description: str