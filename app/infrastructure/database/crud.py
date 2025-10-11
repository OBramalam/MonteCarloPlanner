from sqlalchemy.orm import Session
from typing import Type, TypeVar, Generic, Optional, List, Dict, Any, Union
from ..database.connection import Base

ModelType = TypeVar("ModelType", bound=Base)


class CRUD(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def create(self, db: Session, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record"""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[ModelType]:
        """Get a record by ID"""
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_by_field(self, db: Session, field: str, value: Any) -> Optional[ModelType]:
        """Get a record by any field"""
        if hasattr(self.model, field):
            return db.query(self.model).filter(getattr(self.model, field) == value).first()
        return None
    
    
        def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        query = db.query(self.model)

        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)

        return query.offset(skip).limit(limit).all()

    def update(self, db: Session, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        """Update a record"""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, id: int) -> bool:
        """Delete a record by ID"""
        obj = db.query(self.model).filter(self.model.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
            return True
        return False
    
    def delete_by_field(self, db: Session, field: str, value: Any) -> bool:
        """Delete records by any field"""
        if hasattr(self.model, field):
            objs = db.query(self.model).filter(getattr(self.model, field) == value).all()
            for obj in objs:
                db.delete(obj)
            db.commit()
            return len(objs) > 0
        return False
