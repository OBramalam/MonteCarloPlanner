from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.financial_event import FinancialEventSchemaIn, FinancialEventSchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType
from ...auth.dependencies import get_current_user
from ...database.models.user import User
from typing import List

router = APIRouter(prefix="/financial-events", tags=["financial-events"])

@router.post("/", response_model=FinancialEventSchemaOut, status_code=status.HTTP_201_CREATED)
async def create_financial_event(
    event_data: FinancialEventSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new financial event for the current user"""
    event_data_dict = event_data.dict(exclude_unset=True)
    event_data_dict['user_id'] = current_user.id
    
    emitter.emit(EventType.FINANCIAL_EVENT_CREATE, {
        'data': event_data_dict,
        'db': db
    })
    
    return event_data

@router.get("/{event_id}", response_model=FinancialEventSchemaOut)
async def get_financial_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get financial event by ID for the current user"""
    emitter.emit(EventType.FINANCIAL_EVENT_GET, {
        'event_id': event_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return FinancialEventSchemaOut(id=event_id)

@router.put("/{event_id}", response_model=FinancialEventSchemaOut)
async def update_financial_event(
    event_id: int,
    event_data: FinancialEventSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update financial event by ID for the current user"""
    emitter.emit(EventType.FINANCIAL_EVENT_UPDATE, {
        'event_id': event_id,
        'user_id': current_user.id,
        'data': event_data.dict(exclude_unset=True),
        'db': db
    })
    
    return event_data

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_financial_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete financial event by ID for the current user"""
    emitter.emit(EventType.FINANCIAL_EVENT_DELETE, {
        'event_id': event_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return None

@router.get("/", response_model=List[FinancialEventSchemaOut])
async def get_my_financial_events(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all financial events for the current user"""
    emitter.emit(EventType.FINANCIAL_EVENT_GET, {
        'user_id': current_user.id,
        'skip': skip,
        'limit': limit,
        'db': db
    })
    
    return []
