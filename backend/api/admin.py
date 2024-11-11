from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm
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
        fields = ('email', 'role', 'company')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure the queryset is evaluated here
        self.fields['company'].queryset = Company.objects.all()

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
    list_display = ('email', 'role', 'is_staff', 'is_active',)
    list_filter = ('role', 'is_staff', 'is_active',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'role')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'company', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user')
    fields = ('user', 'company_name')

class AgronomistAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'company', 'user')
    fields = ('user', 'company', 'first_name', 'last_name')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "company":
            kwargs["queryset"] = Company.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class FarmerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'company', 'user')
    fields = ('user', 'company', 'first_name', 'last_name')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "company":
            kwargs["queryset"] = Company.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Agronomist, AgronomistAdmin)
admin.site.register(Farmer, FarmerAdmin)
