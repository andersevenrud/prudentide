#!/bin/sh

mkdir -p deploy/scripts
mkdir -p deploy/configs

touch deploy/configs/service-account-file.json
cp scripts/node.sh deploy/scripts/
cp scripts/npm.sh deploy/scripts/
cp scripts/ci/entrypoint.sh deploy/scripts/
cp scripts/ci/docker-compose.yml deploy/scripts/

echo "Created deployment folder with:"
find deploy
