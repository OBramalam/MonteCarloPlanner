from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user_model import User

class Expense(BaseModel):
    user: User
    expense_name: str
    category: str
    amount: float
    frequency: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None