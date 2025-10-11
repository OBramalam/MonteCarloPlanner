from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.user import UserSchemaIn, UserSchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType
from ...auth.dependencies import get_current_user
from ...database.models.user import User
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserSchemaOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserSchemaIn,
    db: Session = Depends(get_db)
):
    """Create a new user (registration or admin creation)"""
    # Emit event for user creation
    emitter.emit(EventType.USER_CREATE, {
        'data': user_data.dict(exclude_unset=True),
        'db': db
    })
    
    # For now, return the input data (handlers will process)
    return user_data

@router.get("/{user_id}", response_model=UserSchemaOut)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    # Emit event for user retrieval
    emitter.emit(EventType.USER_GET, {
        'user_id': user_id,
        'db': db
    })
    
    # For now, return a placeholder (handlers will process)
    return UserSchemaOut(id=user_id)

@router.put("/{user_id}", response_model=UserSchemaOut)
async def update_user(
    user_id: int,
    user_data: UserSchemaIn,
    db: Session = Depends(get_db)
):
    """Update user by ID"""
    # Emit event for user update
    emitter.emit(EventType.USER_UPDATE, {
        'user_id': user_id,
        'data': user_data.dict(exclude_unset=True),
        'db': db
    })
    
    # For now, return the input data (handlers will process)
    return user_data

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete user by ID"""
    # Emit event for user deletion
    emitter.emit(EventType.USER_DELETE, {
        'user_id': user_id,
        'db': db
    })
    
    return None

@router.get("/", response_model=List[UserSchemaOut])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users with pagination"""
    # Emit event for users retrieval
    emitter.emit(EventType.USER_GET, {
        'skip': skip,
        'limit': limit,
        'db': db
    })
    
    # For now, return empty list (handlers will process)
    return []

@router.get("/me", response_model=UserSchemaOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    # Emit event for current user retrieval
    emitter.emit(EventType.USER_GET, {
        'user_id': current_user.id,
        'db': None  # Handler will get db from dependency
    })
    
    # For now, return the current user (handlers will process)
    return UserSchemaOut.from_orm(current_user)
