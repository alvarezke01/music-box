from django.urls import path
from .views import SpotifyLoginView

urlpatterns = [
    path("auth/spotify/login/", SpotifyLoginView.as_view(), name="spotify-login"),
]

