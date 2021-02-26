# Deployment

CI builds docker images for use in a production environment.

## Clusters

The compose file `scripts/ci/docker-compose.yml` is a template you can use
to deploy all docker services into a cluster with ex Docker Swarm mode
or Kubernetes.

Note that environment variables must be defined inside this file.

## Standalone

Create scaffold an enviroment with `./scripts/deploy.sh`.

This creates the `deploy/` folder that you can transfer to a.

Start up with:

```shell
docker-compose up
./scripts/npm.sh run db:migrate
```
