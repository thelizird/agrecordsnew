from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Company, Agronomist, Farmer

class CustomUserCreationForm(UserCreationForm):
    company = forms.ModelChoiceField(
        queryset=Company.objects.all(),
        required=False,
        empty_label="Select a company",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email', 'role', 'company')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure the queryset is evaluated here
        self.fields['company'].queryset = Company.objects.all()
        # Make email required
        self.fields['email'].required = True

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        company = cleaned_data.get('company')

        if role in [CustomUser.Role.AGRONOMIST, CustomUser.Role.FARMER] and not company:
            raise forms.ValidationError("Company is required for Agronomists and Farmers")
        
        return cleaned_data

    class Media:
        js = ('admin/js/company_field.js',)

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    model = CustomUser
    list_display = ('id', 'username', 'email', 'role', 'is_staff', 'is_active',)
    list_filter = ('role', 'is_staff', 'is_active',)
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'role')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'company', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username',)
    ordering = ('email',)

    def save_model(self, request, obj, form, change):
        creating = not obj.pk  # Check if this is a new object
        company = form.cleaned_data.get('company') if form is not None else None
        
        # First save the user
        super().save_model(request, obj, form, change)
        
        if creating and company:  # Only handle company and profiles for new users
            # Set company relationship
            if hasattr(obj, 'company'):
                obj.company = company
                
            # Create appropriate profile based on role
            if obj.role == CustomUser.Role.AGRONOMIST:
                Agronomist.objects.create(
                    user=obj,
                    company=company
                )
            elif obj.role == CustomUser.Role.FARMER:
                Farmer.objects.create(
                    user=obj,
                    company=company
                )

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'company_name', 'user')
    fields = ('user', 'company_name')
    readonly_fields = ('id',)

class AgronomistAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'company', 'user')
    fields = ('id', 'user', 'company', 'first_name', 'last_name')
    readonly_fields = ('id',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "company":
            kwargs["queryset"] = Company.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class FarmerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'company', 'user')
    fields = ('id', 'user', 'company', 'name')
    readonly_fields = ('id',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "company":
            kwargs["queryset"] = Company.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Agronomist, AgronomistAdmin)
admin.site.register(Farmer, FarmerAdmin)
