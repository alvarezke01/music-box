import base64
import requests
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import SpotifyAccount

BASE_URL = "https://api.spotify.com/v1"

class SpotifyAPIError(Exception):
    """Raised when Spotify returns a non-success response."""
    pass


def refresh_spotify_token(account: SpotifyAccount):
    """
    Refreshes user's Spotify access token if expired
    Returns a valid access token
    """
    if not account.is_token_expired():
        return account.access_token

    token_url = "https://accounts.spotify.com/api/token"

    auth_header = base64.b64encode(
        f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()

    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    data = {
        "grant_type": "refresh_token",
        "refresh_token": account.refresh_token,
    }

    resp = requests.post(token_url, headers=headers, data=data)
    if resp.status_code != 200:
        raise Exception(f"Failed to refresh token: {resp.text}")

    body = resp.json()
    new_access = body["access_token"]
    expires_in = body.get("expires_in", 3600)

    # Save new token
    account.access_token = new_access
    account.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
    account.save(update_fields=["access_token", "token_expires_at"])

    return new_access

def spotify_get(path: str, access_token: str, params=None):
    url = f"{BASE_URL}{path}"
    headers = {"Authorization": f"Bearer {access_token}"}

    resp = requests.get(url, headers=headers, params=params or {})

    if resp.status_code == 204:
        return None

    if not resp.ok:
        try:
            detail = resp.json()
        except:
            detail = resp.text
        raise SpotifyAPIError(f"Spotify GET {path} failed: {detail}")

    return resp.json()

def spotify_user_get(path: str, account: SpotifyAccount, params=None):
    """
    GET for an authenticated user:
    - refreshes token if needed
    - retries once if expired during request
    """
    access_token = refresh_spotify_token(account)

    try:
        return spotify_get(path, access_token, params=params)
    except SpotifyAPIError:
        # token may have just expired mid-request → refresh + retry
        access_token = refresh_spotify_token(account)
        return spotify_get(path, access_token, params=params)