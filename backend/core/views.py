from django.shortcuts import render
from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework import permissions


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

