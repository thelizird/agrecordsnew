from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'farmers', FarmerViewSet, basename='farmer')
router.register(r'fields', FieldViewSet, basename='field')
router.register(r'labs', LabViewSet, basename='lab')
router.register(r'crops', CropViewSet, basename='crops')
router.register(r'fieldhistory', FieldHistoryViewSet, basename='fieldhistory')
router.register(r'soiltests', SoilTestViewSet, basename='soiltest')
router.register(r'yields', YieldViewSet, basename='yield')

urlpatterns = [
    path('farmers/create/', create_farmer_user, name='create_farmer'),
    path('user/me/', get_user_info, name='get_user_info'),
    path('reports/<str:category>/', ReportView.as_view(), name='report'),
    path('', include(router.urls)),
]
