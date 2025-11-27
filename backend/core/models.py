from datetime import timedelta

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


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

class Rating(models.Model):
    """
    Numeric rating (0.00–5.00) that a user gives to a track, album, or artist
    """
    ITEM_TYPE_CHOICES = [
        ("track", "Track"),
        ("album", "Album"),
        ("artist", "Artist"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ratings",
    )
    spotify_id = models.CharField(
        max_length=64,
        help_text="Spotify ID of the track/album/artist being rated",
    )
    item_type = models.CharField(
        max_length=10,
        choices=ITEM_TYPE_CHOICES,
        help_text="Type of Spotify item being rated",
    )

    item_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Readable name of the item (e.g. track/album/artist name).",
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Rating from 0.00 to 5.00.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure one rating per user per item (per type)
        unique_together = ("user", "spotify_id", "item_type")
        ordering = ["-updated_at"]

    def __str__(self):
        return (
            f"Rating(user={self.user_id}, "
            f"{self.item_type}={self.spotify_id}, "
            f"rating={self.rating})"
        )
