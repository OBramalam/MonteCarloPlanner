from rest_framework import serializers
from ..models.income_model import Income
from ..common.utils import calculate_annual_amount, get_frequency_display, format_currency


class IncomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Income
        fields = [
            'id', 'source', 'amount', 'frequency', 'start_date', 
            'end_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):

        user = self.context['request'].user
        income = Income.objects.create(user=user, **validated_data)
        return income
    
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

        data['annual_amount'] = calculate_annual_amount(instance.amount, instance.frequency)
        data['frequency_display'] = get_frequency_display(instance.frequency)
        data['amount_display'] = format_currency(instance.amount)
        data['annual_amount_display'] = format_currency(data['annual_amount'])
        
        return data
