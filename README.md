# Ticket Triage

## Local development

### Postgres
Start Postgres via Docker:

    docker compose up -d

### Temporal
Temporal is **not** run via Docker in this project. Install the Temporal CLI
separately and run the local dev server directly:

    brew install temporal   # macOS; see https://docs.temporal.io/cli for other platforms
    temporal server start-dev

This starts a full local Temporal server (with Web UI) without any extra
containers.

### Django

    cp .env.example .env
    python manage.py migrate
    python manage.py runserver