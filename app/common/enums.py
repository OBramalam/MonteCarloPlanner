from enum import Enum


class SimulationType(str, Enum):
    CHOLESKY = "cholesky"
    BLOCK_BOOTSTRAP = "block_bootstrap"

class SimulationStepType(str, Enum):
    ANNUAL = "annual"
    MONTHLY = "monthly"

class InterpolationMethod(str, Enum):
    LINEAR = "linear"
    FFILL = "ffill"
    
class AssetClass(str, Enum):
    CASH = "cash"
    EQUITY = "equity"
    FIXED_INCOME = "fixed_income"
    