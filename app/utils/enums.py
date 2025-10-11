from enum import Enum


class RiskToleranceChoices(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class FrequencyChoices(str, Enum):
    MONTHLY = "monthly"
    ANNUAL = "annual"
    ONE_TIME = "one_time"


class AssetTypeChoices(str, Enum):
    CASH = "cash"
    STOCKS = "stocks"
    BONDS = "bonds"
    REAL_ESTATE = "real_estate"
    OTHER = "other"


class LiabilityTypeChoices(str, Enum):
    MORTGAGE = "mortgage"
    CREDIT_CARD = "credit_card"
    STUDENT_LOAN = "student_loan"
    CAR_LOAN = "car_loan"
    OTHER = "other"


class EventTypeChoices(str, Enum):
    HOUSE_PURCHASE = "house_purchase"
    INHERITANCE = "inheritance"
    COLLEGE_TUITION = "college_tuition"
    WEDDING = "wedding"
    OTHER = "other"