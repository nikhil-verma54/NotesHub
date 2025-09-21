from django.urls import path
from .views import SignupView, LoginView, HomeView, LogoutView, GoogleAuthView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("home/", HomeView.as_view(), name="home"),
    path("google/", GoogleAuthView.as_view(), name="google-auth"),
]
