from django.db import models
from django.contrib.auth.models import User
from ..common.enums import EventTypeChoices


class FinancialEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='financial_events')
    event_name = models.CharField(max_length=100)
    event_type = models.CharField(
        max_length=20,
        choices=EventTypeChoices.choices,
        default=EventTypeChoices.OTHER
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)