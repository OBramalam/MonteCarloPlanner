from rest_framework import serializers
from ..models.financial_event_model import FinancialEvent
from ..common.utils import get_event_type_display, get_event_category, get_impact_description, format_currency


class FinancialEventSerializer(serializers.ModelSerializer):

    
    class Meta:
        model = FinancialEvent
        fields = [
            'id', 'event_name', 'event_type', 'amount', 'date', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):

        user = self.context['request'].user
        financial_event = FinancialEvent.objects.create(user=user, **validated_data)
        return financial_event
    
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

        data['event_type_display'] = get_event_type_display(instance.event_type)
        data['amount_display'] = format_currency(instance.amount)
        data['date_display'] = instance.date.strftime('%B %d, %Y')
        data['is_future_event'] = instance.date > instance.created_at.date()
        data['event_category'] = get_event_category(instance.event_type)
        data['impact_description'] = get_impact_description(instance.event_type, instance.amount)
        
        return data
