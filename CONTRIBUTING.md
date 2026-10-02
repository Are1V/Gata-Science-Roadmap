# Contributing to Datlas

Focused corrections, stronger lessons, useful projects, and missing topics are welcome.

## Curriculum changes

1. Add or update a topic in `src/data/curriculum.json`.
2. Add its explanation and video reference in `src/data/topic-lessons.json`.
3. Add new video metadata to `src/data/videos.json` only when the video ID is new.
4. Add project briefs and their real external source to `src/content/projects/projects.json`.

Preserve existing topic IDs so shared chapter links remain stable. Keep explanations direct and verify that external resources are public.

## Development checks

```sh
pip install -r requirements.txt
python manage.py check
python manage.py test
python manage.py collectstatic --noinput
```

Do not commit credentials, virtual environments, SQLite databases, collected static files, or downloaded course content.
