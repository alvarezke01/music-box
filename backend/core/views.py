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
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .spotify_client import refresh_spotify_token, spotify_user_get, SpotifyAPIError
from .models import SpotifyAccount, Rating
from .serializers import UserSerializer, RatingSerializer

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

class NowPlayingView(APIView):
    """
    GET /user/now-playing/

    Returns:
      - currently playing track (status = "playing")
      - paused track (status = "paused")
      - inactive if nothing is playing
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Ensure Spotify account exists
        try:
            account = user.spotify_account
        except SpotifyAccount.DoesNotExist:
            return Response({"detail": "Spotify account not found"}, status=400)

        # Refresh token
        access_token = refresh_spotify_token(account)

        # Call Spotify API
        resp = requests.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        # No active device or nothing playing
        if resp.status_code == 204:
            return Response({
                "status": "inactive",
                "is_playing": False,
                "track_name": None,
                "artists": [],
                "album": None,
                "album_image": None,
                "progress_ms": None,
                "duration_ms": None
            })

        # Error case
        if resp.status_code != 200:
            return Response(
                {
                    "detail": "Failed to fetch currently playing",
                    "status_code": resp.status_code,
                    "response": resp.text,
                },
                status=resp.status_code,
            )

        data = resp.json()
        item = data.get("item")

        # Active device but no track item
        if not item:
            return Response({
                "status": "inactive",
                "is_playing": False,
                "track_name": None,
                "artists": [],
                "album": None,
                "album_image": None,
                "progress_ms": None,
                "duration_ms": None
            })

        # Determine play state
        is_playing = data.get("is_playing", False)
        status = "playing" if is_playing else "paused"

        return Response(
            {
                "status": status,
                "is_playing": is_playing,
                "progress_ms": data.get("progress_ms"),
                "duration_ms": item.get("duration_ms"),
                "track_name": item.get("name"),
                "artists": [a["name"] for a in item.get("artists", [])],
                "album": item.get("album", {}).get("name"),
                "album_image": item.get("album", {}).get("images", [{}])[0].get("url")
            }
        )


class RecentlyPlayedView(APIView):
    """
    GET /user/recently-played/

    Returns the user's recently played tracks with:
      - NO duplicate tracks (global dedupe, not just consecutive)
      - At most 5 unique tracks
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Ensure Spotify account exists
        try:
            account = user.spotify_account
        except SpotifyAccount.DoesNotExist:
            return Response({"detail": "Spotify account not found"}, status=400)

        # Refresh access token if needed
        access_token = refresh_spotify_token(account)

        # Fetch from Spotify – get 20 to dedupe
        resp = requests.get(
            "https://api.spotify.com/v1/me/player/recently-played",
            params={"limit": 20},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if resp.status_code != 200:
            return Response(
                {
                    "detail": "Failed to fetch recently played tracks",
                    "status_code": resp.status_code,
                    "response": resp.text,
                },
                status=resp.status_code,
            )

        data = resp.json()
        items = data.get("items", [])

        cleaned = []
        seen_tracks = set()  # track IDs already returned

        for item in items:
            track = item.get("track") or {}
            track_id = track.get("id")
            track_name = track.get("name")
            played_at = item.get("played_at")

            # Skip broken entries
            if not track_name:
                continue

            # Use track_id if available, otherwise fall back to name
            dedupe_key = track_id or track_name

            # Skip if included track 
            if dedupe_key in seen_tracks:
                continue

            cleaned.append({
                "played_at": played_at,
                "track_name": track_name,
                "artists": [a["name"] for a in track.get("artists", [])],
                "album": track.get("album", {}).get("name"),
                "album_image": track.get("album", {}).get("images", [{}])[0].get("url"),
                "duration_ms": track.get("duration_ms"),
            })

            seen_tracks.add(dedupe_key)

            # Only return at most 5 unique tracks
            if len(cleaned) == 5:
                break

        return Response({"items": cleaned})
    
class SearchMusicView(APIView):
    """
    GET /discover/search/music/?q=<query>&type=track,album,artist

    Uses logged-in user's Spotify account to search for tracks, albums,
    and artists via Spotify's /search endpoint, and returns JSON
    structure grouped by type.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Read query parameters
        query = request.query_params.get("q")
        type_param = request.query_params.get("type", "track,album,artist")

        if not query:
            return Response(
                {"detail": "Missing required query parameter 'q'."},
                status=400,
            )

        # Ensure user has linked Spotify account
        try:
            account = request.user.spotify_account
        except SpotifyAccount.DoesNotExist:
            return Response(
                {"detail": "Spotify account not found for this user."},
                status=400,
            )

        # Call Spotify /search via spotify_user_get (handles refresh + retry)
        try:
            raw = spotify_user_get(
                "/search",
                account=account,
                params={
                    "q": query,
                    "type": type_param,  #  track, album, artist
                    "limit": 10,
                },
            )
        except SpotifyAPIError as exc:
            return Response(
                {"detail": str(exc)},
                status=502,
            )

        # Normalize response
        normalized = self._normalize_search_results(raw or {})
        return Response(normalized)

    def _normalize_search_results(self, raw):
        """
        Shape Spotify /search response into:

        {
          "tracks": [...],
          "albums": [...],
          "artists": [...]
        }
        """
        def first_image(images):
            if not images:
                return None
            return images[0].get("url")

        results = {
            "tracks": [],
            "albums": [],
            "artists": [],
        }

        
        tracks_block = raw.get("tracks") or {}
        for item in tracks_block.get("items", []):
            results["tracks"].append(
                {
                    "id": item.get("id"),
                    "type": "track",
                    "name": item.get("name"),
                    "artists": [a.get("name") for a in (item.get("artists") or [])],
                    "album": (item.get("album") or {}).get("name"),
                    "album_image": first_image((item.get("album") or {}).get("images") or []),
                    "duration_ms": item.get("duration_ms"),
                }
            )

        
        albums_block = raw.get("albums") or {}
        for item in albums_block.get("items", []):
            results["albums"].append(
                {
                    "id": item.get("id"),
                    "type": "album",
                    "name": item.get("name"),
                    "artists": [a.get("name") for a in (item.get("artists") or [])],
                    "image": first_image(item.get("images") or []),
                    "release_date": item.get("release_date"),
                }
            )

        artists_block = raw.get("artists") or {}
        for item in artists_block.get("items", []):
            results["artists"].append(
                {
                    "id": item.get("id"),
                    "type": "artist",
                    "name": item.get("name"),
                    "image": first_image(item.get("images") or []),
                    "followers": (item.get("followers") or {}).get("total"),
                    "genres": item.get("genres") or [],
                }
            )

        return results

class RatingListCreateView(APIView):
    """
    GET /ratings/
    List the current user's ratings (most recently updated first)

    POST /ratings/
    Create or update (upsert) a rating for a track/album/artist.

    Example POST body:
    {
      "spotify_id": "06HL4z0CvFAxyc27GXpf02",
      "item_type": "artist",
      "rating": 4.75
    }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only return ratings for authenticated user
        qs = Rating.objects.filter(user=request.user).order_by("-updated_at")
        serializer = RatingSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Use serializer's upsert logic; user comes from request
        serializer = RatingSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        rating_obj = serializer.create(serializer.validated_data)
        # Re-serialize to include read-only fields
        output = RatingSerializer(rating_obj)
        return Response(output.data, status=201)

class RatingItemView(APIView):
    """
    GET /ratings/item/?spotify_id=...&item_type=track|album|artist

    Returns the current user's rating for a specific item, if it exists.

    Response if rating exists:
    {
      "exists": true,
      "rating": {
        "id": 1,
        "spotify_id": "...",
        "item_type": "",
        "item_name": "",
        "rating": "",
        "created_at": "...",
        "updated_at": "...",
      }
    }

    Response if no rating:
    {
      "exists": false,
      "rating": null
    }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        spotify_id = request.query_params.get("spotify_id")
        item_type = request.query_params.get("item_type")

        # Validation
        if not spotify_id or not item_type:
            return Response(
                {"detail": "spotify_id and item_type are required query parameters."},
                status=400,
            )

        # Validate item_type against model choices
        valid_types = {choice[0] for choice in Rating.ITEM_TYPE_CHOICES}
        if item_type not in valid_types:
            return Response(
                {"detail": f"item_type must be one of {sorted(valid_types)}"},
                status=400,
            )

        # Look up rating for current user + item
        rating_obj = Rating.objects.filter(
            user=request.user,
            spotify_id=spotify_id,
            item_type=item_type,
        ).first()

        if rating_obj is None:
            return Response(
                {
                    "exists": False,
                    "rating": None,
                },
                status=200,
            )

        serializer = RatingSerializer(rating_obj)
        return Response(
            {
                "exists": True,
                "rating": serializer.data,
            },
            status=200,
        )
