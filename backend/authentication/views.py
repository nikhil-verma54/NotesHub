from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import json
from urllib.request import urlopen
from urllib.error import URLError
from django.utils.text import slugify


class HomeView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser
        })


class LogoutView(APIView):
    permission_classes = []  # Remove authentication requirement for logout

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            # Still return success even if token is invalid to ensure user can logout
            return Response(status=status.HTTP_205_RESET_CONTENT)


class SignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Use create_user (auto hashes password)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=user_obj.username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
            })
        else:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)


class GoogleAuthView(APIView):
    """Authenticate using a Google ID token from the frontend and return Simple JWT tokens.

    Frontend should obtain the `id_token` (JWT) from Google and POST it here as {"id_token": "..."}.
    We validate it via Google's tokeninfo endpoint, then get-or-create the user by email and mint JWTs.
    """

    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"error": "id_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validate the token with Google
            with urlopen(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}") as resp:
                payload = json.loads(resp.read().decode("utf-8"))

            # Basic validations
            aud = payload.get("aud")
            email = payload.get("email")
            email_verified = payload.get("email_verified")
            full_name = payload.get("name") or ""
            given_name = payload.get("given_name") or ""
            family_name = payload.get("family_name") or ""

            if aud != getattr(settings, "SOCIAL_AUTH_GOOGLE_OAUTH2_KEY", None):
                return Response({"error": "Invalid audience for this token"}, status=status.HTTP_401_UNAUTHORIZED)

            if not email or str(email_verified).lower() not in ("true", "1"):
                return Response({"error": "Email not verified by Google"}, status=status.HTTP_401_UNAUTHORIZED)

            # Determine a nice username from Google profile name
            base_username = slugify(full_name) or slugify(given_name) or email.split("@")[0]
            if not base_username:
                base_username = email.split("@")[0]

            # Helper to ensure uniqueness
            def unique_username(desired: str) -> str:
                candidate = desired
                counter = 1
                while User.objects.filter(username=candidate).exists():
                    candidate = f"{desired}{counter}"
                    counter += 1
                return candidate

            # Link Google login to existing user by email (case-insensitive) if present
            existing = User.objects.filter(email__iexact=email).first()
            if existing:
                user = existing
                created = False
            else:
                user = User.objects.create(
                    username=unique_username(base_username),
                    email=email,
                    first_name=given_name[:150],
                    last_name=family_name[:150],
                )
                # Mark password unusable for accounts created via Google OAuth
                user.set_unusable_password()
                user.save()
                created = True

            # If user was created without a username conflict, it's fine. If username exists with different email,
            # the default get_or_create would have failed — so ensure username uniqueness if needed.
            if created:
                # Already ensured unique username in defaults; nothing more to do
                pass
            else:
                # For existing user, try to align username with Google name if different
                desired = base_username
                if user.username != desired:
                    new_username = unique_username(desired)
                    # Avoid needless save if same
                    if new_username != user.username:
                        user.username = new_username
                        # Optionally update names if empty
                        if not user.first_name and given_name:
                            user.first_name = given_name[:150]
                        if not user.last_name and family_name:
                            user.last_name = family_name[:150]
                        user.save()

            # Issue Simple JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "username": user.username,
                    "email": user.email,
                }
            )
        except URLError:
            return Response({"error": "Failed to verify token with Google"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
