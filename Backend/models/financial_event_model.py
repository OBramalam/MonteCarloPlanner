from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user_model import User

class FinancialEvent(BaseModel):
    user: User
    event_name: str
    event_type: str
    amount: float
    date: datetime
    description: str