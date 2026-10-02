from django.http import Http404
from django.shortcuts import render

from .services import curriculum, find_phase, projects, search, stages


def home(request):
    phases = curriculum()
    context = {
        "active": "home",
        "topic_count": sum(len(phase["topics"]) for phase in phases),
        "chapter_count": len(phases),
        "project_count": len(projects()),
        "featured": [phases[n] for n in [1, 8, 12, 23, 37, 25]],
        "projects": projects()[:4],
    }
    return render(request, "roadmap/home.html", context)


def roadmap_view(request):
    return render(request, "roadmap/roadmap.html", {"active": "roadmap", "stages": stages()})


def chapter(request, slug):
    phase = find_phase(slug)
    if phase is None:
        raise Http404("Chapter not found")
    phases = curriculum()
    position = phases.index(phase)
    next_phase = phases[position + 1] if position + 1 < len(phases) else None
    return render(
        request,
        "roadmap/chapter.html",
        {"active": "roadmap", "phase": phase, "next_phase": next_phase},
    )


def project_list(request):
    return render(request, "roadmap/projects.html", {"active": "projects", "projects": projects()})


def search_view(request):
    query = request.GET.get("q", "")
    return render(request, "roadmap/search.html", {"active": "search", "query": query, "results": search(query)})


def about(request):
    return render(request, "roadmap/about.html", {"active": "about"})
