import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlparse

from django.conf import settings

DATA_ROOT = settings.BASE_DIR / "src"

STAGE_DEFINITIONS = [
    ("Start", [0, 1, 2, 3]),
    ("Math & statistics", [4, 5, 6, 7]),
    ("Work with data", [8, 9, 10, 11, 35]),
    ("Machine learning", [12, 13, 14, 15, 16, 17]),
    ("Go deeper", [18, 19, 20, 21, 22]),
    ("Deep learning & AI", [23, 24, 37, 25]),
    ("Applied fields", [26, 27, 28, 29]),
    ("Ship & grow", [30, 31, 32, 33, 34, 36]),
]


def _read(path):
    with path.open(encoding="utf-8") as source:
        return json.load(source)


@lru_cache(maxsize=1)
def curriculum():
    phases = _read(DATA_ROOT / "data" / "curriculum.json")
    lessons = _read(DATA_ROOT / "data" / "topic-lessons.json")
    videos = _read(DATA_ROOT / "data" / "videos.json")
    for phase in phases:
        phase["chapter"] = f"{phase['number']:02d}"
        for topic in phase["topics"]:
            lesson = lessons.get(topic["id"], {})
            video = videos.get(lesson.get("videoId"), {})
            topic["summary"] = lesson.get("summary", "")
            topic["practice"] = lesson.get("practice", "")
            topic["video"] = video
            topic["video_url"] = video.get("sourceUrl", "")
    return phases


@lru_cache(maxsize=1)
def projects():
    items = _read(DATA_ROOT / "content" / "projects" / "projects.json")
    for item in items:
        item["external_url"] = item["datasetUrl"]
        item["platform"] = platform_name(item["external_url"])
    return items


def platform_name(url):
    host = urlparse(url).netloc.lower()
    if "github" in host or "githubusercontent" in host:
        return "GitHub"
    if "kaggle" in host:
        return "Kaggle"
    if "huggingface" in host:
        return "Hugging Face"
    if "uci.edu" in host:
        return "UCI"
    if "scikit-learn" in host:
        return "scikit-learn"
    return "Project source"


def stages():
    by_number = {phase["number"]: phase for phase in curriculum()}
    return [
        {"name": name, "number": f"{index:02d}", "phases": [by_number[n] for n in numbers]}
        for index, (name, numbers) in enumerate(STAGE_DEFINITIONS, start=1)
    ]


def find_phase(slug):
    return next((phase for phase in curriculum() if phase["id"] == slug), None)


def search(query):
    needle = query.casefold().strip()
    if not needle:
        return []
    results = []
    for phase in curriculum():
        if needle in phase["title"].casefold():
            results.append({"title": phase["title"], "kind": "Chapter", "url": f"/learn/{phase['id']}/"})
        for topic in phase["topics"]:
            haystack = f"{topic['title']} {topic['summary']}".casefold()
            if needle in haystack:
                results.append({"title": topic["title"], "kind": phase["title"], "url": f"/learn/{phase['id']}/#{topic['id']}"})
    for project in projects():
        if needle in f"{project['title']} {project['problem']}".casefold():
            results.append({"title": project["title"], "kind": "Project", "url": project["external_url"], "external": True})
    return results[:60]
