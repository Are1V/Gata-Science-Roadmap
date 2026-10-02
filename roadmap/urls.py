from django.urls import path
from . import views

app_name = "roadmap"
urlpatterns = [
    path("", views.home, name="home"),
    path("roadmap/", views.roadmap_view, name="roadmap"),
    path("learn/<slug:slug>/", views.chapter, name="chapter"),
    path("projects/", views.project_list, name="projects"),
    path("search/", views.search_view, name="search"),
    path("about/", views.about, name="about"),
]
