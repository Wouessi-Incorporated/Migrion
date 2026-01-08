# Migrion Project

This project has been restructured into a monorepo-style layout.

## Structure

- **apps/**: Contains the application source code.
  - `web`: The Next.js/React frontend.
  - `api`: The backend API.
  - `cms-config`: Directus CMS configuration and seeds.
  - `marketing-automation`: n8n workflows and templates.
- **infra/**: Infrastructure configuration (Docker).
- **docs/**: Project documentation and whitepapers.
- **packages/**: Shared packages or content (e.g., seed-content).

## Getting Started

1.  Navigate to the `infra` directory:
    ```bash
    cd infra
    ```

2.  Start the services:
    ```bash
    docker-compose up --build
    ```

## Services

- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **CMS (Directus)**: http://localhost:8055
- **n8n**: http://localhost:5678
