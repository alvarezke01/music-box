from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import SpotifyAccount

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    # Extra fields derived from SpotifyAccount
    display_name = serializers.SerializerMethodField()
    spotify_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "display_name", "spotify_id"]

    def get_display_name(self, obj):
        # If user has a SpotifyAccount, use display_name
        account = getattr(obj, "spotify_account", None)
        if account and account.display_name:
            return account.display_name
        return obj.username

    def get_spotify_id(self, obj):
        account = getattr(obj, "spotify_account", None)
        if account:
            return account.spotify_id
        return None
