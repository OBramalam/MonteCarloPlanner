from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, timedelta
from app.domain.simulation_engine.common.enums import SimulationStepType
from app.domain.simulation_engine.common.types import ExpectedReturns, AssetCosts


class BaseExpense(BaseModel):
    expense_name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class BaseFinancialEvent(BaseModel):
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[date] = None
    description: Optional[str] = None


class BaseIncome(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class BaseLiability(BaseModel):
    liability_name: Optional[str] = None
    liability_type: Optional[str] = None
    balance: Optional[float] = None
    interest_rate: Optional[float] = None
    monthly_payment: Optional[float] = None


class BaseAsset(BaseModel):
    asset_name: Optional[str] = None
    asset_class: Optional[str] = None
    description: Optional[str] = None
    expected_return: Optional[float] = None
    expected_costs: Optional[float] = None

class BaseFinancialPlan(BaseModel):
    financial_plan_name: Optional[str] = None
    start_date: Optional[date] = date.today()
    end_date: Optional[date] = date.today() + timedelta(days=365*50)
    initial_wealth: Optional[float] = 0.0
    inflation: Optional[float] = 0.03
    number_of_simulations: Optional[int] = 5000
    step_size: Optional[SimulationStepType] = SimulationStepType.ANNUAL
    expected_returns: Optional[ExpectedReturns] = None
    asset_costs: Optional[AssetCosts] = None

class BasePortfolio(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    equity_weight: Optional[float] = None
