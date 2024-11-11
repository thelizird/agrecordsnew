from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, FarmerSerializer, FieldSerializer, LabSerializer, CropSerializer, FieldHistorySerializer, SoilTestSerializer, ReportSerializer, AddEntrySerializer, YieldSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Farmer, Field, Lab, Crop, FieldHistory, SoilTest, Report, Yield
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
    })


class FarmerViewSet(viewsets.ModelViewSet):
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user
        user = self.request.user

        # Return all farmers associated with the logged-in user
        return Farmer.objects.filter(user=user)

class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user
        user = self.request.user

        # Filter the queryset by the 'farmer' query parameter, if provided
        farmer_id = self.request.query_params.get('farmer', None)

        # Get the farmers associated with the logged-in user
        farmers = Farmer.objects.filter(user=user)

        # If the farmer_id is provided, filter fields for that specific farmer
        if farmer_id:
            return Field.objects.filter(farmer__in=farmers, farmer_id=farmer_id)

        # Otherwise, return fields for all the user's farmers
        return Field.objects.filter(farmer__in=farmers)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class LabViewSet(viewsets.ModelViewSet):
    serializer_class = LabSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        farmer_id = self.request.query_params.get('farmer', None)  # Get farmer parameter from the query string
        farmers = Farmer.objects.filter(user=user)  # Get the farmers associated with the user

        # If farmer_id is provided, filter further by that farmer's ID
        if farmer_id:
            farmers = farmers.filter(id=farmer_id)  # Ensure this farmer belongs to the user

        # Return only labs of the filtered farmers
        queryset = Lab.objects.filter(farmer__in=farmers)
        print("Filtered Labs:", queryset)  # Debugging to check the filtering
        return queryset

    def perform_create(self, serializer):
        farmer = serializer.validated_data.get('farmer')
        if farmer.user != self.request.user:
            raise serializers.ValidationError("You can only create labs for your own farmers.")
        serializer.save()

class CropViewSet(viewsets.ModelViewSet):
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        farmer_id = self.request.query_params.get('farmer', None)  # Get farmer parameter from the query string
        farmers = Farmer.objects.filter(user=user)  # Get the farmers associated with the user

        # If farmer_id is provided, filter further by that farmer's ID
        if farmer_id:
            farmers = farmers.filter(id=farmer_id)  # Ensure this farmer belongs to the user

        # Return only crops of the filtered farmers
        queryset = Crop.objects.filter(farmer__in=farmers)
        print("Filtered Crops:", queryset)  # Debugging to check the filtering
        return queryset
class FieldHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = FieldHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user
        user = self.request.user

        # Get all farmers associated with this user
        farmers = Farmer.objects.filter(user=user)

        # Get all fields owned by these farmers
        fields = Field.objects.filter(farmer__in=farmers)

        # Return the field histories for the user's fields
        return FieldHistory.objects.filter(field__in=fields)

class SoilTestViewSet(viewsets.ModelViewSet):
    serializer_class = SoilTestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user
        user = self.request.user
        
        # Get the farmers that belong to the user
        farmers = Farmer.objects.filter(user=user)
        
        # Get the fields that belong to those farmers
        fields = Field.objects.filter(farmer__in=farmers)
        
        # Start with the base queryset
        queryset = SoilTest.objects.filter(field__in=fields)
        
        # Apply additional filtering if present in request parameters
        field = self.request.query_params.get('field', None)
        crop = self.request.query_params.get('crop', None)
        start_date = self.request.query_params.get('startDate', None)
        end_date = self.request.query_params.get('endDate', None)
        
        if field:
            # Split the field parameter into a list and use __in to match any of the IDs
            queryset = queryset.filter(field__in=field.split(','))
        
        if crop:
            # Similar handling for crop if crop filtering is used
            queryset = queryset.filter(crop__in=crop.split(','))

        if start_date and end_date:
            # Filter by date range if both start and end dates are provided
            queryset = queryset.filter(test_date__range=[start_date, end_date])
        
        return queryset

class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category):
        year = timezone.now().year
        report, created = Report.objects.get_or_create(user=request.user, category=category, year=year)
        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def post(self, request, category):
        year = timezone.now().year
        report, created = Report.objects.get_or_create(user=request.user, category=category, year=year)

        # Use AddEntrySerializer to append new entries
        serializer = AddEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(report, serializer.validated_data)
            return Response({"message": "Entry added successfully", "report": ReportSerializer(report).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class YieldViewSet(viewsets.ModelViewSet):
    serializer_class = YieldSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the logged-in user
        user = self.request.user
        
        # Get the farmers that belong to the user
        user_farmers = Farmer.objects.filter(user=user)
        
        # Start with base queryset filtered by user's farmers
        queryset = Yield.objects.filter(farmer__in=user_farmers)
        
        # Get filter parameters
        farmer = self.request.query_params.get('farmer', None)
        field = self.request.query_params.get('field', None)
        date_after = self.request.query_params.get('date_after', None)
        date_before = self.request.query_params.get('date_before', None)
        
        # Apply filters if they exist
        if farmer:
            queryset = queryset.filter(farmer_id=farmer)
        
        if field:
            queryset = queryset.filter(field_id=field)
            
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
            
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        
        print("Yield Query Params:", self.request.query_params)
        print("Filtered Yield Data:", queryset.values())
        
        return queryset

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'] = serializers.CharField(required=True)  # Keep username field
        self.fields['password'] = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        logger.info(f"Received attrs: {attrs}")
        
        # Get the username/email from the request
        username = attrs.get('username')
        
        try:
            data = super().validate(attrs)
            logger.info("Authentication successful")
            # Add role to response
            data['role'] = self.user.role
            return data
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise serializers.ValidationError({
                'detail': 'Invalid credentials.'
            })

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        logger.info(f"Received login request with data: {request.data}")
        
        # Get the email from the request
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'detail': 'Both email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Modify the request data to use username instead of email
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
            # Replace email with username in the request data
            modified_data = request.data.copy()
            modified_data['username'] = user.username
            request._full_data = modified_data
        except User.DoesNotExist:
            return Response(
                {'detail': 'No user found with this email.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().post(request, *args, **kwargs)