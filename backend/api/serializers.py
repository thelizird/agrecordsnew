from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Farmer, Field, Lab, Crop, FieldHistory, SoilTest, Report, Yield, CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "password", "role"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True}
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', CustomUser.Role.FARMER)
        )
        return user


class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = ['id', 'user', 'company', 'name']

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = ['field_id', 'farmer', 'state', 'city', 'address', 'zip', 'latitude', 'longitude', 'field_name']

class LabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lab
        fields = ['lab_id', 'lab_name', 'farmer']

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = ['crop_id', 'crop_name', 'farmer']

class FieldHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldHistory
        fields = ['field_hist_id', 'field', 'crop', 'plant_date', 'harvest_date', 'yield_amount']

class SoilTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTest
        fields = [
            'soil_id', 'test_date', 'lab', 'field', 'crop', 'ph', 'salts', 'chlorides', 'sodium', 'cec', 
            'excess_lime', 'organic_matter', 'organic_n', 'ammonium_n', 'nitrate_n', 'phosphorus', 
            'potassium_ppm', 'potassium_meq_per_100g', 'calcium_ppm', 'calcium_meq_per_100g', 
            'magnesium_ppm', 'magnesium_meq_per_100g', 'sulfate', 'zinc', 'iron', 'manganese', 
            'copper', 'boron', 'recom_nitrogen', 'recom_phos', 'recom_potash', 'recom_calcium', 
            'recom_magnesium', 'recom_sulphur', 'recom_zinc', 'recom_iron', 'recom_manganese', 
            'recom_copper', 'recom_boron', 'recom_gypsum', 'recom_lime'
        ]

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'user', 'category', 'text', 'year']
        read_only_fields = ['year']

class AddEntrySerializer(serializers.Serializer):
    new_entry = serializers.CharField()

    def update(self, instance, validated_data):
        new_entry = validated_data.get('new_entry')
        instance.add_entry(new_entry)
        return instance

class YieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Yield
        fields = ['id', 'farmer', 'field', 'date', 'yield_number']