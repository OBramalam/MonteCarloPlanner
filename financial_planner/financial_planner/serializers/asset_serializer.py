from rest_framework import serializers
from ..models.asset_model import Asset
from ..common.utils import get_asset_type_display, get_asset_category, format_currency


class AssetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_name', 'asset_type', 'value', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        asset = Asset.objects.create(user=user, **validated_data)
        return asset
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def delete(self, instance):
        instance.delete()
        return True
    
    def to_representation(self, instance):

        data = super().to_representation(instance)

        data['asset_type_display'] = get_asset_type_display(instance.asset_type)
        data['value_display'] = format_currency(instance.value)
        data['asset_category'] = get_asset_category(instance.asset_type)
        
        return data
    