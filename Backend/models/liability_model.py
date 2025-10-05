from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user_model import User

class Liability(BaseModel):
    user: User
    liability_name: str
    liability_type: str  # "mortgage", "credit_card", "student_loan"
    balance: float
    interest_rate: float
    monthly_payment: float