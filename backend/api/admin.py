from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Add 'role' to the list display
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    
    # Add 'role' to the fieldsets
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Add 'role' to the add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        # If this is an edit form (obj exists) and not an add form
        if obj:
            return ('role',) + super().get_readonly_fields(request, obj)
        return super().get_readonly_fields(request, obj)

# Register CustomUser with the CustomUserAdmin
admin.site.register(CustomUser, CustomUserAdmin)
