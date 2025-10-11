from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.income import IncomeSchemaIn, IncomeSchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType
from ...auth.dependencies import get_current_user
from ...database.models.user import User
from typing import List

router = APIRouter(prefix="/incomes", tags=["incomes"])

@router.post("/", response_model=IncomeSchemaOut, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_data: IncomeSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new income for the current user"""
    # Add current user's ID to the data
    income_data_dict = income_data.dict(exclude_unset=True)
    income_data_dict['user_id'] = current_user.id
    
    # Emit event for income creation
    emitter.emit(EventType.INCOME_CREATE, {
        'data': income_data_dict,
        'db': db
    })
    
    return income_data

@router.get("/", response_model=List[IncomeSchemaOut])
async def get_my_incomes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all incomes for the current user"""
    emitter.emit(EventType.INCOME_GET, {
        'user_id': current_user.id,
        'db': db
    })
    
    return []

@router.get("/{income_id}", response_model=IncomeSchemaOut)
async def get_my_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific income for the current user"""
    emitter.emit(EventType.INCOME_GET, {
        'income_id': income_id,
        'user_id': current_user.id,  # Ensure user can only access their own income
        'db': db
    })
    
    return IncomeSchemaOut(id=income_id)

@router.put("/{income_id}", response_model=IncomeSchemaOut)
async def update_my_income(
    income_id: int,
    income_data: IncomeSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific income for the current user"""
    emitter.emit(EventType.INCOME_UPDATE, {
        'income_id': income_id,
        'user_id': current_user.id,  # Ensure user can only update their own income
        'data': income_data.dict(exclude_unset=True),
        'db': db
    })
    
    return income_data

@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific income for the current user"""
    emitter.emit(EventType.INCOME_DELETE, {
        'income_id': income_id,
        'user_id': current_user.id,  # Ensure user can only delete their own income
        'db': db
    })
    
    return None
