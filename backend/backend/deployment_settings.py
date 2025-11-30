import os 
import dj_database_url
from .settings import * 
from .settings import BASE_DIR

ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME')]
CSRF_TRUSTED_ORIGINS = ['https://'+os.environ.get('RENDER_EXTERNAL_HOSTNAME')]

DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    'https://noteshubb.onrender.com',
    'https://noteshub-66uw.onrender.com'
]

# Required for credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Required headers for preflight requests
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-csrftoken',
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    'https://noteshubb.onrender.com',
    'https://noteshub-66uw.onrender.com'
]

# Session settings
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'

# Make sure your ALLOWED_HOSTS is set
ALLOWED_HOSTS = [
    'noteshub-66uw.onrender.com',
    'noteshubb.onrender.com',
    'localhost',
    '127.0.0.1'
]
STORAGES = {
    "default":{
        "BACKEND" : "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND" : "whitenoise.storage.CompressedStaticFilesStorage",
    },

}

DATABASES = {
    'default': dj_database_url.config(
        default= os.environ['DATABASE_URL'], 
        conn_max_age=600
    )
}

