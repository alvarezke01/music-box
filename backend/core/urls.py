from django.urls import path
from .views import SpotifyLoginView, SpotifyCallbackView, AuthUserView, NowPlayingView, RecentlyPlayedView

urlpatterns = [
    path("auth/spotify/login/", SpotifyLoginView.as_view(), name="spotify-login"),
    path("auth/spotify/callback/", SpotifyCallbackView.as_view(), name="spotify-callback"),
    path("auth/user/", AuthUserView.as_view(), name="auth-user"),
    path("user/now-playing/", NowPlayingView.as_view(), name="now-playing"),
    path("user/recently-played/", RecentlyPlayedView.as_view(), name="user-recently-played"),
]

