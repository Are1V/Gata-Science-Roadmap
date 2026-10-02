# Datlas

**The open roadmap to Data Science.**

Datlas is a server-rendered Django learning platform with 38 connected chapters, 676 guided topics, curated video lessons, and 23 practical projects. Project cards open the real GitHub, Kaggle, UCI, Hugging Face, dataset, or official source directly.

## Stack

- Python 3.12
- Django 5
- Django templates and modern CSS
- WhiteNoise for static assets
- Gunicorn for production

The application has no Node.js, React, Astro, or frontend build step.

## Local development

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

Open `http://127.0.0.1:8000`.

Run the checks with:

```sh
python manage.py check
python manage.py test
python manage.py collectstatic --noinput
```

## Content

| File | Purpose |
| --- | --- |
| `src/data/curriculum.json` | Chapters and stable topic IDs |
| `src/data/topic-lessons.json` | Explanations, prerequisites, videos, and practice |
| `src/data/videos.json` | Curated video metadata and source URLs |
| `src/content/projects/projects.json` | Project briefs and external sources |
| `roadmap/services.py` | Content loading, stages, project platforms, and search |

## Deploy to Render

The included `render.yaml` defines the web service. In Render, create a new Blueprint from this repository. Render installs the requirements, collects static files, and starts Gunicorn automatically.

Django needs a running Python server and cannot run on GitHub Pages.

## License

Datlas code and original content are released under the MIT License. Linked videos, datasets, and resources remain the property of their creators.
