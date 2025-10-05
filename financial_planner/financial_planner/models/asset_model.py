from django.db import models
from django.contrib.auth.models import User
from ..common.enums import AssetTypeChoices


class Asset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assets')
    asset_name = models.CharField(max_length=100)
    asset_type = models.CharField(
        max_length=20,
        choices=AssetTypeChoices.choices,
        default=AssetTypeChoices.OTHER
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)