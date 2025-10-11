from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.expense import ExpenseSchemaIn, ExpenseSchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType
from ...auth.dependencies import get_current_user
from ...database.models.user import User
from typing import List

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/", response_model=ExpenseSchemaOut, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new expense for the current user"""
    expense_data_dict = expense_data.dict(exclude_unset=True)
    expense_data_dict['user_id'] = current_user.id
    
    emitter.emit(EventType.EXPENSE_CREATE, {
        'data': expense_data_dict,
        'db': db
    })
    
    return expense_data

@router.get("/{expense_id}", response_model=ExpenseSchemaOut)
async def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get expense by ID for the current user"""
    emitter.emit(EventType.EXPENSE_GET, {
        'expense_id': expense_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return ExpenseSchemaOut(id=expense_id)

@router.put("/{expense_id}", response_model=ExpenseSchemaOut)
async def update_expense(
    expense_id: int,
    expense_data: ExpenseSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update expense by ID for the current user"""
    emitter.emit(EventType.EXPENSE_UPDATE, {
        'expense_id': expense_id,
        'user_id': current_user.id,
        'data': expense_data.dict(exclude_unset=True),
        'db': db
    })
    
    return expense_data

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete expense by ID for the current user"""
    emitter.emit(EventType.EXPENSE_DELETE, {
        'expense_id': expense_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return None

@router.get("/", response_model=List[ExpenseSchemaOut])
async def get_my_expenses(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all expenses for the current user"""
    emitter.emit(EventType.EXPENSE_GET, {
        'user_id': current_user.id,
        'skip': skip,
        'limit': limit,
        'db': db
    })
    
    return []
