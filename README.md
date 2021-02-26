# Prudentide

**WIP** Project and task management API.

## Features

* Organize with projects, tasks, labels, and milestones
* Task discussions, attachments, and watch lists
* Delayed task actions and webhook signaling
* Role-based resource access control
* Group based project access control
* Identity provider authorization
* Notifications via SMS/email/push
* Notification templating and localization
* Queue based event system for background jobs
* Easy configuration, management, and deployment
* Advanced logging and error reporting
* REST API with OpenAPI documentation
* Complete E2E test coverage
* Resource caching

## Documentation

* [Architecture](docs/architecture.md)
* [Deployment](docs/deployment.md)
* [Configuration](docs/configuration.md)
* [Management](docs/management.md)
* [Development](docs/development.md)
* [Docker](docs/docker.md)

## Requirements

Requires **docker** and **docker-compose**.

Setup checklist:

1. Create Auth0 tenant and application (currently the only supported IdP)
2. Place Firebase project credentials in `configs/service-account-file.json`

## Installation

To set up a local development environment:

```shell
cp .env.example .env
edit .env
docker-compose up
./scripts/npm.sh run db:migrate
```

## License

MIT
