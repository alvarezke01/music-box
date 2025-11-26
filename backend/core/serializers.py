from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import SpotifyAccount, Rating

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


class RatingSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating numeric ratings.

    - user is taken from request.user (not from the payload)
    - upsert based on (user, spotify_id, item_type)
    """

    class Meta:
        model = Rating
        fields = [
            "id",
            "spotify_id",
            "item_type",
            "rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        """
        Upsert:
        If rating for (user, spotify_id, item_type) already exists,
        update its rating value instead of creating a duplicate row.
        """
        user = self.context["request"].user

        spotify_id = validated_data["spotify_id"]
        item_type = validated_data["item_type"]
        rating_value = validated_data["rating"]

        rating_obj, _created = Rating.objects.update_or_create(
            user=user,
            spotify_id=spotify_id,
            item_type=item_type,
            defaults={"rating": rating_value},
        )
        return rating_obj