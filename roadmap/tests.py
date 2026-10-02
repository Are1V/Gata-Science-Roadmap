from django.test import SimpleTestCase, override_settings
from django.urls import reverse

from .services import curriculum, projects, search, stages


class ContentTests(SimpleTestCase):
    def test_curriculum_is_complete_and_unique(self):
        phases = curriculum()
        topics = [topic for phase in phases for topic in phase["topics"]]
        self.assertEqual(len(phases), 38)
        self.assertEqual(len(topics), 676)
        self.assertEqual(len({topic["id"] for topic in topics}), len(topics))
        self.assertTrue(all(topic["summary"] for topic in topics))

    def test_stages_include_every_chapter_once(self):
        numbers = [phase["number"] for stage in stages() for phase in stage["phases"]]
        self.assertCountEqual(numbers, range(38))

    def test_every_project_has_an_external_source(self):
        self.assertEqual(len(projects()), 23)
        self.assertTrue(all(item["external_url"].startswith("https://") for item in projects()))

    def test_search_finds_topics_and_projects(self):
        self.assertTrue(any(item["title"] == "Transformers" for item in search("transformers")))
        self.assertTrue(any(item["kind"] == "Project" for item in search("Titanic")))


@override_settings(SECURE_SSL_REDIRECT=False)
class PageTests(SimpleTestCase):
    def test_public_pages_render(self):
        for name in ["home", "roadmap", "projects", "about"]:
            response = self.client.get(reverse(f"roadmap:{name}"))
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, "Datlas")

    def test_chapter_renders_video_links(self):
        response = self.client.get(reverse("roadmap:chapter", args=["large-language-models"]))
        self.assertContains(response, "Large language models")
        self.assertContains(response, "YouTube")

    def test_project_cards_link_to_external_sources(self):
        response = self.client.get(reverse("roadmap:projects"))
        self.assertContains(response, 'class="project-card"', count=23)
        self.assertContains(response, "Open project source", count=23)

    def test_unknown_chapter_returns_404(self):
        self.assertEqual(self.client.get("/learn/not-a-chapter/").status_code, 404)
