# app/application/services/income_service.py
from typing import List, Dict, Optional
from datetime import date
from sqlalchemy.orm import Session
from ...infrastructure.database.crud import CRUD
from ...infrastructure.database.models.income import Income as IncomeModel
from ...infrastructure.database.connection import get_db

class IncomeService:
    """Service for income CRUD operations using the generic CRUD class."""
    
    def __init__(self):
        self.crud = CRUD(IncomeModel)
    
    async def create_income(self, income_data: dict, user_id: str) -> IncomeModel:
        """Create a new income stream."""
        # Add user_id to the data
        income_data["user_id"] = user_id
        
        # Get database session
        db = next(get_db())
        try:
            return self.crud.create(db, income_data)
        finally:
            db.close()
    
    async def get_incomes(self, user_id: str, skip: int = 0, limit: int = 100) -> List[IncomeModel]:
        """Get all incomes for a user."""
        db = next(get_db())
        try:
            return self.crud.get_multi(
                db, 
                skip=skip, 
                limit=limit, 
                filters={"user_id": user_id}
            )
        finally:
            db.close()
    
    async def get_income(self, income_id: int, user_id: str) -> Optional[IncomeModel]:
        """Get a specific income by ID."""
        db = next(get_db())
        try:
            income = self.crud.get(db, income_id)
            # Verify it belongs to the user
            if income and income.user_id == user_id:
                return income
            return None
        finally:
            db.close()
    
    async def update_income(self, income_id: int, income_data: dict, user_id: str) -> Optional[IncomeModel]:
        """Update an income stream."""
        db = next(get_db())
        try:
            income = self.crud.get(db, income_id)
            if not income or income.user_id != user_id:
                return None
            
            # Remove user_id from update data (can't change ownership)
            income_data.pop("user_id", None)
            
            return self.crud.update(db, income, income_data)
        finally:
            db.close()
    
    async def delete_income(self, income_id: int, user_id: str) -> bool:
        """Delete an income stream."""
        db = next(get_db())
        try:
            income = self.crud.get(db, income_id)
            if not income or income.user_id != user_id:
                return False
            
            return self.crud.delete(db, income_id)
        finally:
            db.close()