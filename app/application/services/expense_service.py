from typing import List, Dict, Optional
from datetime import date
from sqlalchemy.orm import Session
from ...infrastructure.database.crud import CRUD
from ...infrastructure.database.models.expense import Expense as ExpenseModel
from ...infrastructure.database.connection import get_db

class ExpenseService:
    """Service for expense CRUD operations using the generic CRUD class."""
    
    def __init__(self):
        self.crud = CRUD(ExpenseModel)
    
    async def create_expense(self, expense_data: dict, user_id: str) -> ExpenseModel:
        """Create a new expense."""
        expense_data["user_id"] = user_id
        
        db = next(get_db())
        try:
            return self.crud.create(db, expense_data)
        finally:
            db.close()
    
    async def get_expenses(self, user_id: str, skip: int = 0, limit: int = 100) -> List[ExpenseModel]:
        """Get all expenses for a user."""
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
    
    async def get_expense(self, expense_id: int, user_id: str) -> Optional[ExpenseModel]:
        """Get a specific expense by ID."""
        db = next(get_db())
        try:
            expense = self.crud.get(db, expense_id)
            if expense and expense.user_id == user_id:
                return expense
            return None
        finally:
            db.close()
    
    async def update_expense(self, expense_id: int, expense_data: dict, user_id: str) -> Optional[ExpenseModel]:
        """Update an expense."""
        db = next(get_db())
        try:
            expense = self.crud.get(db, expense_id)
            if not expense or expense.user_id != user_id:
                return None
            
            expense_data.pop("user_id", None)
            return self.crud.update(db, expense, expense_data)
        finally:
            db.close()
    
    async def delete_expense(self, expense_id: int, user_id: str) -> bool:
        """Delete an expense."""
        db = next(get_db())
        try:
            expense = self.crud.get(db, expense_id)
            if not expense or expense.user_id != user_id:
                return False
            
            return self.crud.delete(db, expense_id)
        finally:
            db.close()