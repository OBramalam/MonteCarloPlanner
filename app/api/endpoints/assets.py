from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.asset import AssetSchemaIn, AssetSchemaOut
from ...database.connection import get_db
from ...events import emitter, EventType
from ...auth.dependencies import get_current_user
from ...database.models.user import User
from typing import List

router = APIRouter(prefix="/assets", tags=["assets"])

@router.post("/", response_model=AssetSchemaOut, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset_data: AssetSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new asset for the current user"""
    asset_data_dict = asset_data.dict(exclude_unset=True)
    asset_data_dict['user_id'] = current_user.id
    
    emitter.emit(EventType.ASSET_CREATE, {
        'data': asset_data_dict,
        'db': db
    })
    
    return asset_data

@router.get("/{asset_id}", response_model=AssetSchemaOut)
async def get_asset(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get asset by ID for the current user"""
    emitter.emit(EventType.ASSET_GET, {
        'asset_id': asset_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return AssetSchemaOut(id=asset_id)

@router.put("/{asset_id}", response_model=AssetSchemaOut)
async def update_asset(
    asset_id: int,
    asset_data: AssetSchemaIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update asset by ID for the current user"""
    emitter.emit(EventType.ASSET_UPDATE, {
        'asset_id': asset_id,
        'user_id': current_user.id,
        'data': asset_data.dict(exclude_unset=True),
        'db': db
    })
    
    return asset_data

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete asset by ID for the current user"""
    emitter.emit(EventType.ASSET_DELETE, {
        'asset_id': asset_id,
        'user_id': current_user.id,
        'db': db
    })
    
    return None

@router.get("/", response_model=List[AssetSchemaOut])
async def get_my_assets(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all assets for the current user"""
    emitter.emit(EventType.ASSET_GET, {
        'user_id': current_user.id,
        'skip': skip,
        'limit': limit,
        'db': db
    })
    
    return []
