from django.urls import path
from .views import SpotifyLoginView, SpotifyCallbackView

urlpatterns = [
    path("auth/spotify/login/", SpotifyLoginView.as_view(), name="spotify-login"),
    path("auth/spotify/callback/", SpotifyCallbackView.as_view(), name="spotify-callback"),
]

