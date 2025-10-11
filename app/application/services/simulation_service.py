from typing import List, Dict
from datetime import date
from app.domain.domain_entities import Income, Expense, Portfolio, FinancialPlan
from app.domain.simulation_engine.common.types import CashFlow, SimulationPortfolioWeights
from app.domain.simulation_engine.common.enums import SimulationType, SimulationStepType, InterpolationMethod

def convert_portfolio_to_weights(portfolios: List[Portfolio], start_year: int, end_year: int) -> List[SimulationPortfolioWeights]:

    def date_to_step(d: date) -> int:
        """Convert date to step number relative to start_year."""
        return d.year - start_year
    
    events = {}
    
    for portfolio in portfolios:
        start_step = max(0, date_to_step(portfolio.start_date))
        end_step = min(end_year - start_year, date_to_step(portfolio.end_date))
        
        # Add weight at start
        events[start_step] = portfolio.equity_weight
        
        # Add weight change at end+1 (if it's within our range)
        if end_step + 1 <= end_year - start_year:
            # We need to determine what the weight should be after this portfolio ends
            # For now, we'll keep the same weight (you might want different logic)
            events[end_step + 1] = portfolio.equity_weight
    
    # Convert to SimulationPortfolioWeights
    weights = []
    for step in sorted(events.keys()):
        if 0 <= step <= end_year - start_year:
            weights.append(SimulationPortfolioWeights(
                step=float(step),
                stocks=events[step],  # Assuming equity_weight maps to stocks
                bonds=0.0,  # You might want to calculate this
                # cash will be calculated automatically as 1 - stocks - bonds
            ))
    
    # Ensure we have at least one weight at step 0
    if not weights or weights[0].step != 0:
        weights.insert(0, SimulationPortfolioWeights(step=0.0, stocks=0.9, bonds=0.0))
    
    return weights



def build_cash_flows(
    incomes: List[Income],
    expenses: List[Expense],
    *,
    start_year: int,
    end_year: int,
    step_size: str = "annual"  # "annual" or "monthly"
) -> List[CashFlow]:
    """
    Build sparse CashFlow points (only at changes) suitable for interpolation.
    - Emits a CashFlow at each change step with the new net flow.
    - Does NOT generate values for every timestep.

    Assumptions:
    - Steps are relative to start_year (step 0 == Jan 1 of start_year).
    - For annual steps, values are annualized amounts.
    """

    def to_annual(amount: float, frequency: str) -> float:
        f = (frequency or "").lower()
        if f == "monthly":
            return amount * 12
        if f in ("weekly",):
            return amount * 52
        if f in ("bi-weekly", "biweekly"):
            return amount * 26
        if f in ("semi-monthly", "semimonthly"):
            return amount * 24
        if f in ("quarterly",):
            return amount * 4
        if f in ("semi-annual", "semiannual"):
            return amount * 2
        if f in ("annual", "yearly", ""):
            return amount
        # default: treat as monthly
        return amount * 12

    # Collect delta events: step -> change in annual net cashflow
    events: Dict[int, float] = {}

    def add_delta(step: int, delta: float):
        if step < 0:
            return
        events[step] = events.get(step, 0.0) + delta

    # Helper: map a date to a relative step index
    def year_to_step(d: date) -> int:
        return d.year - start_year

    # Incomes: +amount at start, -amount at end+1
    for inc in incomes or []:
        annual = to_annual(inc.amount, getattr(inc, "frequency", "annual"))
        s = year_to_step(getattr(inc, "start_date"))
        e = year_to_step(getattr(inc, "end_date"))
        add_delta(max(0, s), +annual)
        add_delta(e + 1, -annual)

    # Expenses: -amount at start, +amount at end+1
    for exp in expenses or []:
        annual = to_annual(exp.amount, getattr(exp, "frequency", "annual"))
        s = year_to_step(getattr(exp, "start_date"))
        e = year_to_step(getattr(exp, "end_date"))
        add_delta(max(0, s), -annual)
        add_delta(e + 1, +annual)

    # Restrict to [0, end_step]
    end_step = end_year - start_year
    events = {k: v for k, v in events.items() if 0 <= k <= end_step}

    # Build sparse CashFlow points: running total at each change step
    cashflows: List[CashFlow] = []
    running = 0.0
    for step in sorted(events.keys()):
        running += events[step]
        cashflows.append(CashFlow(step=float(step), value=running))

    # Ensure at least a baseline point if nothing changes within range
    if not cashflows:
        cashflows = [CashFlow(step=0.0, value=0.0)]

    return cashflows



def build_simulation_data(
    incomes: List[Income],
    expenses: List[Expense],
    portfolios: List[Portfolio],
    financial_plan: FinancialPlan,
):
    cash_flows = build_cash_flows(incomes, expenses, start_year=financial_plan.start_date.year, end_year=financial_plan.end_date.year)
    weights = convert_portfolio_to_weights(portfolios, financial_plan.start_date.year, financial_plan.end_date.year)
    # TODO: oneoff_transactions = build_oneoff_transactions(financial_events)

    data = {
        "number_of_simulations": financial_plan.number_of_simulations,
        "end_step": financial_plan.end_date.year - financial_plan.start_date.year,
        "weights": weights,
        "savings_rates": cash_flows,
        "oneoff_transactions": [],
        "inflation": financial_plan.inflation,
        "initial_wealth": financial_plan.initial_wealth,
        "percentiles": [25, 50, 75],
        "simulation_type": SimulationType.CHOLESKY,
        "step_size": SimulationStepType.ANNUAL,
        "weights_interpolation": InterpolationMethod.FFILL,
        "savings_rate_interpolation": InterpolationMethod.FFILL,
        "asset_costs": financial_plan.asset_costs,
        "asset_returns": financial_plan.expected_returns
    }

    return data