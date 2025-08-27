import os
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise
from pathlib import Path

# Define the base directory
BASE_DIR = Path(__file__).resolve().parent.parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sales_mgmt_sys.settings')

application = get_wsgi_application()

# Correct WhiteNoise configuration
application = WhiteNoise(application, root=os.path.join(BASE_DIR, 'staticfiles'))

# For Vercel
app = application