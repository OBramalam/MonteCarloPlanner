
from sqlalchemy import Column, Integer, String, DateTime, Date, Numeric, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..connection import Base
from ...common.base_entities import BaseFinancialPlan


class FinancialPlan(Base, BaseFinancialPlan):
    __tablename__ = "financial_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="financial_plans")
    # Store complex types as JSON
    expected_returns = Column(JSON, nullable=True)
    asset_costs = Column(JSON, nullable=True)
    # Store enum as string
    step_size = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())