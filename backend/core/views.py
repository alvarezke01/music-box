from django.shortcuts import render
from urllib.parse import urlencode
import base64
from datetime import timedelta

import requests
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SpotifyAccount
from .serializers import UserSerializer

User = get_user_model()


class SpotifyLoginView(APIView):
    """
    GET /auth/spotify/login/
    Redirects to Spotify's authorization page
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        client_id = settings.SPOTIFY_CLIENT_ID
        redirect_uri = settings.SPOTIFY_REDIRECT_URI
        scopes = settings.SPOTIFY_SCOPES or ""

        if not client_id or not redirect_uri:
            # Safety check if env isn't set
            from rest_framework.response import Response
            return Response(
                {"detail": "Spotify is not configured correctly."},
                status=500,
            )

        # .env uses comma-separated scopes; Spotify expects space-separated
        scope_str = scopes.replace(",", " ")

        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": scope_str,
        }

        url = "https://accounts.spotify.com/authorize?" + urlencode(params)
        return redirect(url)


class SpotifyCallbackView(APIView):
    """
    GET /auth/spotify/callback/?code=...&state=...

    1. Exchange code for access + refresh tokens
    2. Fetch the user's Spotify profile
    3. Create or find a Django user + SpotifyAccount
    4. Issue our own JWT tokens for the app to use
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Check for error or missing code
        error = request.query_params.get("error")
        if error:
            return Response({"detail": f"Spotify returned an error: {error}"}, status=400)

        code = request.query_params.get("code")
        if not code:
            return Response({"detail": "Missing 'code' parameter from Spotify."}, status=400)

        client_id = settings.SPOTIFY_CLIENT_ID
        client_secret = settings.SPOTIFY_CLIENT_SECRET
        redirect_uri = settings.SPOTIFY_REDIRECT_URI

        if not client_id or not client_secret or not redirect_uri:
            return Response(
                {"detail": "Spotify is not configured correctly on the server."},
                status=500,
            )

        # Exchange code for tokens
        token_url = "https://accounts.spotify.com/api/token"

        basic_auth = base64.b64encode(
            f"{client_id}:{client_secret}".encode("utf-8")
        ).decode("utf-8")

        headers = {
            "Authorization": f"Basic {basic_auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }

        token_resp = requests.post(token_url, headers=headers, data=data)

        if token_resp.status_code != 200:
            return Response(
                {
                    "detail": "Failed to exchange code for tokens.",
                    "status_code": token_resp.status_code,
                    "response": token_resp.text,
                },
                status=500,
            )

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)

        # Use access token to get user's Spotify profile
        me_resp = requests.get(
            "https://api.spotify.com/v1/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if me_resp.status_code != 200:
            return Response(
                {
                    "detail": "Failed to fetch Spotify profile.",
                    "status_code": me_resp.status_code,
                    "response": me_resp.text,
                },
                status=500,
            )

        profile = me_resp.json()
        spotify_id = profile.get("id")
        display_name = profile.get("display_name") or spotify_id
        email = profile.get("email", "")

        if not spotify_id:
            return Response(
                {"detail": "Spotify profile did not include an 'id'."},
                status=500,
            )

        # Create or reuse a Django user

        # Use a username like "spotify_<spotify_id>"
        username = f"spotify_{spotify_id}"

        try:
            # If we already have a SpotifyAccount for this spotify_id, reuse user
            account = SpotifyAccount.objects.select_related("user").get(spotify_id=spotify_id)
            user = account.user

        except SpotifyAccount.DoesNotExist:
            # Otherwise, create a new Django user
            user, _created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )
            # And create a SpotifyAccount for it
            account = SpotifyAccount(
                user=user,
                spotify_id=spotify_id,
                display_name=display_name or "",
                email=email or "",
            )

        # Update tokens + expiry on the SpotifyAccount
        account.access_token = access_token
        account.refresh_token = refresh_token
        account.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        account.display_name = display_name or account.display_name
        account.email = email or account.email
        account.save()

        # Issue JWT tokens for this user
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        params = urlencode(
            {
                "access": str(access),
                "refresh": str(refresh),
            }
        )

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:8081")
        redirect_url = f"{frontend_url}/?{params}"

        return redirect(redirect_url)

class AuthUserView(APIView):
    """
    GET /auth/user/
    Returns currently authenticated user's profile
    Requires valid JWT access token
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
