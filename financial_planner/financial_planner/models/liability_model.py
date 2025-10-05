from django.db import models
from django.contrib.auth.models import User
from ..common.enums import LiabilityTypeChoices


class Liability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liabilities')
    liability_name = models.CharField(max_length=100)
    liability_type = models.CharField(
        max_length=20,
        choices=LiabilityTypeChoices.choices,
        default=LiabilityTypeChoices.OTHER
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)