from django.apps import AppConfig
from django.contrib import admin


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Customize admin site
        admin.site.site_header = "AgRecords Admin"
        admin.site.site_title = "AgRecords Admin Portal"
        admin.site.index_title = "Welcome to AgRecords Admin Portal"
