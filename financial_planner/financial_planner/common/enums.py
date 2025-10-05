from django.db import models


class FrequencyChoices(models.TextChoices):
    MONTHLY = 'monthly', 'Monthly'
    ANNUAL = 'annual', 'Annual'
    ONE_TIME = 'one_time', 'One Time'


class RiskToleranceChoices(models.TextChoices):
    CONSERVATIVE = 'conservative', 'Conservative'
    MODERATE = 'moderate', 'Moderate'
    AGGRESSIVE = 'aggressive', 'Aggressive'


class AssetTypeChoices(models.TextChoices):
    CASH = 'cash', 'Cash'
    STOCKS = 'stocks', 'Stocks'
    BONDS = 'bonds', 'Bonds'
    REAL_ESTATE = 'real_estate', 'Real Estate'
    OTHER = 'other', 'Other'


class LiabilityTypeChoices(models.TextChoices):
    MORTGAGE = 'mortgage', 'Mortgage'
    CREDIT_CARD = 'credit_card', 'Credit Card'
    STUDENT_LOAN = 'student_loan', 'Student Loan'
    CAR_LOAN = 'car_loan', 'Car Loan'
    OTHER = 'other', 'Other'


class EventTypeChoices(models.TextChoices):
    HOUSE_PURCHASE = 'house_purchase', 'House Purchase'
    INHERITANCE = 'inheritance', 'Inheritance'
    COLLEGE_TUITION = 'college_tuition', 'College Tuition'
    WEDDING = 'wedding', 'Wedding'
    OTHER = 'other', 'Other'
