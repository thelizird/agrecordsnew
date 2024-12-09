from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django.utils import timezone
from django.conf import settings


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        COMPANY = 'COMPANY', 'Company'
        AGRONOMIST = 'AGRONOMIST', 'Agronomist'
        FARMER = 'FARMER', 'Farmer'
    
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.COMPANY
    )

    def is_company(self):
        return self.role == self.Role.COMPANY

    def is_agronomist(self):
        return self.role == self.Role.AGRONOMIST

    def is_farmer(self):
        return self.role == self.Role.FARMER

class Company(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)

    def __str__(self):
        return self.company_name

    class Meta:
        db_table = 'company'

class Agronomist(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE)
    company = models.ForeignKey('Company', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        db_table = 'agronomist'

# Modified Farmer model
class Farmer(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE)
    company = models.ForeignKey('Company', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'farmer'

class Field(models.Model):
    field_id = models.AutoField(primary_key=True)
    farmer = models.ForeignKey('Farmer', on_delete=models.CASCADE)
    state = models.CharField(max_length=100, blank=True, null=True)  # Optional
    city = models.CharField(max_length=100, blank=True, null=True)  # Optional
    address = models.CharField(max_length=255, blank=True, null=True)  # Optional
    zip = models.CharField(max_length=20, blank=True, null=True)  # Optional
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)  # Optional
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)  # Optional
    field_name = models.CharField(max_length=100)  # Required

    def __str__(self):
        return self.field_name
    
    class Meta:
        managed = False
        db_table = 'field'

class Lab(models.Model):
    lab_id = models.AutoField(primary_key=True)
    lab_name = models.CharField(max_length=255)  # lab_name is not unique
    farmer = models.ForeignKey('Farmer', on_delete=models.CASCADE)  # Connect Lab to Farmer

    def __str__(self):
        return self.lab_name
    
    class Meta:
        managed = False
        db_table = 'lab'

class Crop(models.Model):
    crop_id = models.AutoField(primary_key=True)
    crop_name = models.CharField(max_length=255)

    def __str__(self):
        return self.crop_name
    
    class Meta:
        managed = False
        db_table = 'crop'

class YieldUnit(models.Model):
    yield_unit_id = models.AutoField(primary_key=True)
    yield_unit = models.CharField(max_length=50)  # e.g., 'bushels', 'tons', etc.

    def __str__(self):
        return self.yield_unit

    class Meta:
        managed = False
        db_table = 'yield_unit'

class PriceHistory(models.Model):
    price_history_id = models.AutoField(primary_key=True)
    yield_unit = models.ForeignKey('YieldUnit', on_delete=models.CASCADE)
    date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Price: ${self.price} per {self.yield_unit} on {self.date}"

    class Meta:
        managed = False
        db_table = 'price_history'

class FieldHistory(models.Model):
    field_hist_id = models.AutoField(primary_key=True)
    field_id = models.ForeignKey('Field', on_delete=models.CASCADE)
    crop_id = models.ForeignKey('Crop', on_delete=models.CASCADE)
    yield_amount = models.FloatField()
    yield_unit_id = models.ForeignKey('YieldUnit', on_delete=models.CASCADE)
    test_date = models.DateField()

    def __str__(self):
        return f"Field History {self.field_hist_id}"

    class Meta:
        managed = False
        db_table = 'field_history'

class SoilTest(models.Model):
    soil_id = models.AutoField(primary_key=True)
    test_date = models.DateField()
    lab = models.ForeignKey('Lab', on_delete=models.CASCADE)
    field = models.ForeignKey('Field', on_delete=models.CASCADE)
    ph = models.FloatField()
    salts = models.FloatField()
    chlorides = models.FloatField()
    sodium = models.FloatField()
    cec = models.FloatField()  # Cation Exchange Capacity
    excess_lime = models.FloatField()
    organic_matter = models.FloatField()
    organic_n = models.FloatField()
    ammonium_n = models.FloatField()
    nitrate_n = models.FloatField()
    phosphorus = models.FloatField()
    potassium_ppm = models.FloatField()
    potassium_meq_per_100g = models.FloatField()
    calcium_ppm = models.FloatField()
    calcium_meq_per_100g = models.FloatField()
    magnesium_ppm = models.FloatField()
    magnesium_meq_per_100g = models.FloatField()
    sulfate = models.FloatField()
    zinc = models.FloatField()
    iron = models.FloatField() 
    manganese = models.FloatField()
    copper = models.FloatField()
    boron = models.FloatField()
    recom_nitrogen = models.FloatField()
    recom_phos = models.FloatField()
    recom_potash = models.FloatField()
    recom_calcium = models.FloatField()
    recom_magnesium = models.FloatField()
    recom_sulfur = models.FloatField()
    recom_zinc = models.FloatField()
    recom_iron = models.FloatField()
    recom_manganese = models.FloatField()
    recom_copper = models.FloatField()
    recom_boron = models.FloatField()
    recom_gypsum = models.FloatField()
    recom_lime = models.FloatField()

    def __str__(self):
        return f"Soil Test {self.soil_id}"
    
    class Meta:
        managed = False
        db_table = 'soil_test'

class Report(models.Model):
    CATEGORY_CHOICES = [
        ('fertilizer_application', 'Fertilizer Application'),
        ('seeding_new_crop', 'Seeding New Crop'),
        ('irrigation', 'Irrigation'),
        ('herbicide_application', 'Herbicide Application'),
        ('pesticide_application', 'Pesticide Application'),
        ('harvest', 'Harvest'),
        ('mechanical_disturbance', 'Mechanical Disturbance'),
        ('weather', 'Weather'),
        ('livestock', 'Livestock'),
        ('management', 'Management'),
        ('other', 'Other'),
        # Add more categories as needed
    ]
    
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    text = models.TextField(default="", blank=True)
    year = models.PositiveIntegerField(default=timezone.now().year)

    class Meta:
        managed = False
        db_table = 'api_report'
        unique_together = ('category', 'year')

    def __str__(self):
        return f'{self.category} report ({self.year})'

    def add_entry(self, new_entry):
        self.text += f'\n{new_entry}'
        self.save()

class Yield(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE)  # Connect to Farmer model
    field = models.ForeignKey(Field, on_delete=models.CASCADE)  # Connect to Field model
    date = models.DateField()  # Date of yield entry
    yield_number = models.DecimalField(max_digits=10, decimal_places=2)  # Yield amount

    def __str__(self):
        return f"Yield for {self.farmer} on {self.date}: {self.yield_number}"

    class Meta:
        managed = False
        db_table = 'yield'

