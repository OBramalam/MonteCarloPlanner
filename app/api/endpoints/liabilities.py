from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.liability import LiabilitySchemaIn, LiabilitySchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType
from ...auth.dependencies import get_current_user
from ...database.models.user import User
from typing import List

router = APIRouter(prefix="/liabilities", tags=["liabilities"])

@router.post("/", response_model=LiabilitySchemaOut, status_code=status.HTTP_201_CREATED)
async def create_liability(
    liability_data: LiabilitySchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new liability for the current user"""
    liability_data_dict = liability_data.dict(exclude_unset=True)
    liability_data_dict['user_id'] = current_user.id
    
    emitter.emit(EventType.LIABILITY_CREATE, {
        'data': liability_data_dict,
        'db': db
    })
    
    return liability_data

@router.get("/{liability_id}", response_model=LiabilitySchemaOut)
async def get_liability(
    liability_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get liability by ID for the current user"""
    emitter.emit(EventType.LIABILITY_GET, {
        'liability_id': liability_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return LiabilitySchemaOut(id=liability_id)

@router.put("/{liability_id}", response_model=LiabilitySchemaOut)
async def update_liability(
    liability_id: int,
    liability_data: LiabilitySchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update liability by ID for the current user"""
    emitter.emit(EventType.LIABILITY_UPDATE, {
        'liability_id': liability_id,
        'user_id': current_user.id,
        'data': liability_data.dict(exclude_unset=True),
        'db': db
    })
    
    return liability_data

@router.delete("/{liability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_liability(
    liability_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete liability by ID for the current user"""
    emitter.emit(EventType.LIABILITY_DELETE, {
        'liability_id': liability_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return None

@router.get("/", response_model=List[LiabilitySchemaOut])
async def get_my_liabilities(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all liabilities for the current user"""
    emitter.emit(EventType.LIABILITY_GET, {
        'user_id': current_user.id,
        'skip': skip,
        'limit': limit,
        'db': db
    })
    
    return []
