from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Check if we're using email or username
            if '@' in str(username):
                user = User.objects.get(email=username)
            else:
                user = User.objects.get(username=username)
                
            logger.info(f"Found user: {user.username}")
            if user.check_password(password):
                logger.info("Password check successful")
                return user
            else:
                logger.info("Password check failed")
                return None
        except User.DoesNotExist:
            logger.error(f"User not found for identifier: {username}")
            return None
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None 