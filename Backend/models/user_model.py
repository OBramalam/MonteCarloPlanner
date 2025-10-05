# Backend/models/user_profile.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    age: int
    retirement_age: int
    risk_tolerance: str
    last_updated: datetime