from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..schemas.user import UserSchemaIn, UserSchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user (OAuth2 password flow)"""
    # Emit event for user login
    emitter.emit(EventType.USER_LOGIN, {
        'username': form_data.username,
        'password': form_data.password,
        'db': db
    })
    
    # For now, return placeholder (handlers will process)
    return {"access_token": "placeholder", "token_type": "bearer"}

@router.post("/logout")
async def logout():
    """Logout user"""
    # Emit event for user logout
    emitter.emit(EventType.USER_LOGOUT, {})
    
    return {"message": "Logged out successfully"}
