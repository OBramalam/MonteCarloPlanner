from django.db import models
from django.contrib.auth.models import User as DjangoUser
from ..common.enums import RiskToleranceChoices


class UserProfile(models.Model):
    user = models.OneToOneField(DjangoUser, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    age = models.IntegerField()
    retirement_age = models.IntegerField()
    risk_tolerance = models.CharField(
        max_length=20,
        choices=RiskToleranceChoices.choices,
        default=RiskToleranceChoices.MODERATE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)