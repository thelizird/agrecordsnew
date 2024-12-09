from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, FarmerSerializer, FieldSerializer, LabSerializer, CropSerializer, FieldHistorySerializer, SoilTestSerializer, ReportSerializer, AddEntrySerializer, YieldSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    Farmer, 
    Field, 
    Lab, 
    Crop, 
    FieldHistory, 
    SoilTest, 
    Report, 
    Yield,
    Company, 
    Agronomist, 
    CustomUser
)
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
import logging
from django.db import transaction
from .models import CustomUser, Farmer
from .serializers import UserSerializer, FarmerSerializer

logger = logging.getLogger(__name__)

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    try:
        user = request.user
        print("=== User Info Debug ===")
        print("User requesting info:", user)
        print("User ID:", user.id)
        print("User role:", user.role)
        
        # Initialize company_id as None
        company_id = None
        
        # Check user's role and get the appropriate company ID
        if user.role == 'COMPANY':
            try:
                company = Company.objects.get(user=user)
                print("Found company:", company)
                print("Company ID:", company.id)
                company_id = company.id
            except Company.DoesNotExist:
                print("No company found for user with ID:", user.id)
                print("All companies:", Company.objects.all().values('id', 'user_id', 'company_name'))
        elif user.role in ['AGRONOMIST', 'FARMER']:
            try:
                if user.role == 'AGRONOMIST':
                    agronomist = Agronomist.objects.get(user=user)
                    company_id = agronomist.company_id
                else:
                    farmer = Farmer.objects.get(user=user)
                    company_id = farmer.company_id
                print(f"Found {user.role} company ID:", company_id)
            except (Agronomist.DoesNotExist, Farmer.DoesNotExist) as e:
                print(f"No {user.role.lower()} profile found:", str(e))

        print("Final company_id:", company_id)
        print("=== End Debug ===")

        return Response({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'company': company_id,
            'email': user.email
        })
    except Exception as e:
        print("Error in get_user_info:", str(e))
        import traceback
        print("Full traceback:", traceback.format_exc())
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class FarmerViewSet(viewsets.ModelViewSet):
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Only allow companies and agronomists to view farmers
        if user.role == CustomUser.Role.COMPANY:
            # Get all farmers associated with this company
            return Farmer.objects.filter(company__user=user)
        elif user.role == CustomUser.Role.AGRONOMIST:
            # Get all farmers associated with the agronomist's company
            try:
                agronomist = Agronomist.objects.get(user=user)
                return Farmer.objects.filter(company=agronomist.company)
            except Agronomist.DoesNotExist:
                return Farmer.objects.none()
        else:
            # For farmers, return an empty queryset or just their own record
            return Farmer.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        # Only allow companies to create farmers
        if request.user.role != CustomUser.Role.COMPANY:
            return Response(
                {"error": "Only companies can create farmers"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        farmer_id = self.request.query_params.get('farmer', None)

        # Company users can see all fields from their farmers
        if user.role == CustomUser.Role.COMPANY:
            if farmer_id:
                return Field.objects.filter(
                    farmer__company__user=user,
                    farmer_id=farmer_id
                )
            return Field.objects.filter(farmer__company__user=user)

        # Agronomists can see fields from farmers in their company
        elif user.role == CustomUser.Role.AGRONOMIST:
            try:
                agronomist = Agronomist.objects.get(user=user)
                if farmer_id:
                    return Field.objects.filter(
                        farmer__company=agronomist.company,
                        farmer_id=farmer_id
                    )
                return Field.objects.filter(farmer__company=agronomist.company)
            except Agronomist.DoesNotExist:
                return Field.objects.none()

        # Farmers can only see their own fields
        elif user.role == CustomUser.Role.FARMER:
            try:
                farmer = Farmer.objects.get(user=user)
                return Field.objects.filter(farmer=farmer)
            except Farmer.DoesNotExist:
                return Field.objects.none()

        return Field.objects.none()

    def create(self, request, *args, **kwargs):
        user = self.request.user
        
        # Validate that the farmer_id in the request belongs to the correct company/agronomist
        farmer_id = request.data.get('farmer')
        
        if user.role == CustomUser.Role.COMPANY:
            if not Farmer.objects.filter(id=farmer_id, company__user=user).exists():
                return Response(
                    {"error": "You can only create fields for farmers in your company"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == CustomUser.Role.AGRONOMIST:
            try:
                agronomist = Agronomist.objects.get(user=user)
                if not Farmer.objects.filter(id=farmer_id, company=agronomist.company).exists():
                    return Response(
                        {"error": "You can only create fields for farmers in your company"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Agronomist.DoesNotExist:
                return Response(
                    {"error": "Agronomist profile not found"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == CustomUser.Role.FARMER:
            try:
                farmer = Farmer.objects.get(user=user)
                if str(farmer.id) != str(farmer_id):
                    return Response(
                        {"error": "You can only create fields for yourself"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Farmer.DoesNotExist:
                return Response(
                    {"error": "Farmer profile not found"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().create(request, *args, **kwargs)

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
        user = self.request.user
        
        # Initialize base queryset based on user role
        if user.role == CustomUser.Role.COMPANY:
            # Company users can see all soil tests from their farmers
            queryset = SoilTest.objects.filter(field__farmer__company__user=user)
        elif user.role == CustomUser.Role.AGRONOMIST:
            # Agronomists can see soil tests from farmers in their company
            try:
                agronomist = Agronomist.objects.get(user=user)
                queryset = SoilTest.objects.filter(field__farmer__company=agronomist.company)
            except Agronomist.DoesNotExist:
                return SoilTest.objects.none()
        elif user.role == CustomUser.Role.FARMER:
            # Farmers can only see their own soil tests
            try:
                farmer = Farmer.objects.get(user=user)
                queryset = SoilTest.objects.filter(field__farmer=farmer)
            except Farmer.DoesNotExist:
                return SoilTest.objects.none()
        else:
            return SoilTest.objects.none()

        # Apply additional filters
        farmer = self.request.query_params.get('farmer', None)
        field = self.request.query_params.get('field', None)
        date_after = self.request.query_params.get('date_after', None)
        date_before = self.request.query_params.get('date_before', None)
        
        # Filter by farmer if specified and user has permission
        if farmer:
            if user.role == CustomUser.Role.FARMER:
                # Farmers can only see their own data, so ignore the farmer filter
                pass
            else:
                queryset = queryset.filter(field__farmer_id=farmer)
        
        # Apply remaining filters
        if field:
            field_ids = field.split(',')
            queryset = queryset.filter(field_id__in=field_ids)
            
        if date_after:
            queryset = queryset.filter(test_date__gte=date_after)
            
        if date_before:
            queryset = queryset.filter(test_date__lte=date_before)
        
        return queryset.order_by('test_date')

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
        user = self.request.user
        
        # Initialize base queryset
        if user.role == CustomUser.Role.COMPANY:
            # Company users can see all yields from their farmers
            queryset = Yield.objects.filter(farmer__company__user=user)
        elif user.role == CustomUser.Role.AGRONOMIST:
            # Agronomists can see yields from farmers in their company
            try:
                agronomist = Agronomist.objects.get(user=user)
                queryset = Yield.objects.filter(farmer__company=agronomist.company)
            except Agronomist.DoesNotExist:
                return Yield.objects.none()
        elif user.role == CustomUser.Role.FARMER:
            # Farmers can only see their own yields
            try:
                farmer = Farmer.objects.get(user=user)
                queryset = Yield.objects.filter(farmer=farmer)
            except Farmer.DoesNotExist:
                return Yield.objects.none()
        else:
            return Yield.objects.none()

        # Apply additional filters
        farmer = self.request.query_params.get('farmer', None)
        field = self.request.query_params.get('field', None)
        date_after = self.request.query_params.get('date_after', None)
        date_before = self.request.query_params.get('date_before', None)
        
        # Filter by farmer if specified and user has permission
        if farmer:
            if user.role == CustomUser.Role.FARMER:
                # Farmers can only see their own data, so ignore the farmer filter
                pass
            else:
                queryset = queryset.filter(farmer_id=farmer)
        
        # Apply remaining filters
        if field:
            field_ids = field.split(',')
            queryset = queryset.filter(field_id__in=field_ids)
            
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
            
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        
        return queryset.order_by('date')

    def perform_create(self, serializer):
        # Ensure the user can only create yields for appropriate farmers
        user = self.request.user
        farmer_id = self.request.data.get('farmer')
        
        if user.role == CustomUser.Role.COMPANY:
            if not Farmer.objects.filter(id=farmer_id, company__user=user).exists():
                raise serializers.ValidationError("You can only create yields for farmers in your company")
        elif user.role == CustomUser.Role.AGRONOMIST:
            try:
                agronomist = Agronomist.objects.get(user=user)
                if not Farmer.objects.filter(id=farmer_id, company=agronomist.company).exists():
                    raise serializers.ValidationError("You can only create yields for farmers in your company")
            except Agronomist.DoesNotExist:
                raise serializers.ValidationError("Agronomist profile not found")
        elif user.role == CustomUser.Role.FARMER:
            try:
                farmer = Farmer.objects.get(user=user)
                if str(farmer.id) != str(farmer_id):
                    raise serializers.ValidationError("You can only create yields for yourself")
            except Farmer.DoesNotExist:
                raise serializers.ValidationError("Farmer profile not found")
        
        serializer.save()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'] = serializers.CharField(required=True)
        self.fields['password'] = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        logger.info(f"Validating with attrs: {attrs}")
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
        
        # Get the identifier and password from the request
        identifier = request.data.get('identifier')
        password = request.data.get('password')
        
        if not identifier or not password:
            return Response(
                {'detail': 'Both identifier and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Modify the request data to use username
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            # Try to find user by email first, then username
            if '@' in identifier:
                user = User.objects.get(email=identifier)
            else:
                user = User.objects.get(username=identifier)
                
            # Replace identifier with username in the request data
            modified_data = request.data.copy()
            modified_data['username'] = user.username
            request.data.clear()
            request.data.update(modified_data)
            
            logger.info(f"Modified request data: {request.data}")
            
            return super().post(request, *args, **kwargs)
        except User.DoesNotExist:
            return Response(
                {'detail': 'No user found with these credentials.'},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_farmer_user(request):
    print("Creating farmer user")
    print("Request data:", request.data)
    
    # Update required fields to use 'name' instead of 'first_name' and 'last_name'
    required_fields = ['username', 'email', 'password', 'company', 'name']
    missing_fields = [field for field in required_fields if not request.data.get(field)]
    
    if missing_fields:
        return Response(
            {
                "error": f"Missing required fields: {', '.join(missing_fields)}",
                "received_data": request.data
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        try:
            # First create the user
            user_data = {
                'username': request.data.get('username'),
                'email': request.data.get('email'),
                'password': request.data.get('password'),
                'role': 'FARMER',
                'company': request.data.get('company')
            }
            print("User data:", user_data)
            
            user_serializer = UserSerializer(data=user_data)
            if user_serializer.is_valid():
                user = user_serializer.save()
                
                # Update farmer data to use single 'name' field
                farmer_data = {
                    'user': user.id,
                    'company': request.data.get('company'),
                    'name': request.data.get('name')
                }
                print("Farmer data:", farmer_data)
                
                farmer_serializer = FarmerSerializer(data=farmer_data)
                if farmer_serializer.is_valid():
                    farmer_serializer.save()
                    return Response({
                        'user': user_serializer.data,
                        'farmer': farmer_serializer.data
                    }, status=status.HTTP_201_CREATED)
                else:
                    print("Farmer serializer errors:", farmer_serializer.errors)
                    raise serializers.ValidationError(farmer_serializer.errors)
            print("User serializer errors:", user_serializer.errors)
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Exception:", str(e))
            raise serializers.ValidationError(str(e))