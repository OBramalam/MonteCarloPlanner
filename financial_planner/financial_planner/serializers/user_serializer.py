from rest_framework import serializers
from django.contrib.auth.models import User
from ..models.user_model import UserProfile
from ..common.utils import get_risk_tolerance_display


class UserProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'address', 'city', 'state', 'age', 'retirement_age',
            'risk_tolerance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):

        user = self.context['request'].user
        user_profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults=validated_data
        )
        if not created:
            for attr, value in validated_data.items():
                setattr(user_profile, attr, value)
            user_profile.save()
        return user_profile
    
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

        data['full_name'] = f"{instance.user.first_name} {instance.user.last_name}".strip()
        data['years_to_retirement'] = instance.retirement_age - instance.age
        data['risk_tolerance_display'] = get_risk_tolerance_display(instance.risk_tolerance)
        
        return data