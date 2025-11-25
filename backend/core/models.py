from django.db import models
from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta


class SpotifyAccount(models.Model):
    """
    Stores Spotify account + tokens for a user
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="spotify_account",
    )
    spotify_id = models.CharField(max_length=64, unique=True)
    display_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)

    access_token = models.CharField(max_length=512)
    refresh_token = models.CharField(max_length=512)
    token_expires_at = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_token_expired(self) -> bool:
        return timezone.now() >= self.token_expires_at

    def __str__(self):
        return f"SpotifyAccount({self.user.username}, {self.spotify_id})"

