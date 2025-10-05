from rest_framework import serializers
from ..models.liability_model import Liability
from ..common.utils import get_liability_type_display, calculate_total_interest, format_currency, format_percentage


class LiabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = Liability
        fields = [
            'id', 'liability_name', 'liability_type', 'balance', 
            'interest_rate', 'monthly_payment', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):

        user = self.context['request'].user
        liability = Liability.objects.create(user=user, **validated_data)
        return liability
    
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

        data['liability_type_display'] = get_liability_type_display(instance.liability_type)
        data['annual_payment'] = float(instance.monthly_payment) * 12
        data['total_interest_paid'] = calculate_total_interest(
            instance.balance, instance.monthly_payment, 
            instance.interest_rate, instance.liability_type
        )

        data['balance_display'] = format_currency(instance.balance)
        data['monthly_payment_display'] = format_currency(instance.monthly_payment)
        data['annual_payment_display'] = format_currency(data['annual_payment'])
        data['interest_rate_display'] = format_percentage(instance.interest_rate)
        
        return data
