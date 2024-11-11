from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Company, Agronomist, Farmer

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == CustomUser.Role.COMPANY:
            Company.objects.create(user=instance)
        elif instance.role == CustomUser.Role.AGRONOMIST:
            company = getattr(instance, 'company', None)
            if company:
                Agronomist.objects.create(user=instance, company=company)
        elif instance.role == CustomUser.Role.FARMER:
            company = getattr(instance, 'company', None)
            if company:
                Farmer.objects.create(user=instance, company=company) 