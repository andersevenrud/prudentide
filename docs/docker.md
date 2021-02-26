# Docker

This project is managed with docker for all environments.

## Environments

The standard environment is the development environment.
This launches the HTTP API and Queue processer from the same thread.

In the production environment these are separated by docker services.

## Services

* `8080` API server
* `8081` HailHog interface
* `8082` PHPMyAdmin

## Docker volumes

* `db_data` MySQL database
* `redis_data` Redis database
* `storage_data` User uploaded resources

## Volume directories

* `logs` Application logs
* `configs` Application configurations (ro)

## Compose variables

* `GOOGLE_APPLICATION_CREDENTIALS` - The firebase credentials file
* `DOCKER_APP_PORT` - The API server exposed HTTP port
* `DOCKER_MAILHOG_PORT` - MailHog interface exposed HTTP port
* `DOCKER_RESTART_POLICY` - Restart policy for docker services
* `DOCKER_PHPMYADMIN_PORT` - PHPMyAdmin port

## Notes

This docker setup does not use `node` as the main user by default because
this will make virtual volume binding fail.

A workround for this is to use `docker-compose exec --user node <service> <command>`
whenever you need to.
