#!/bin/sh

# defaults
COMPOSE_FILE="docker-compose.test.yml"
PROJECT_NAME="test"

if [ "$1" = "migration" ]; then
  COMPOSE_FILE="docker-compose.migration-test.yml"
  PROJECT_NAME="test-migration"
fi

echo "Using compose file: $COMPOSE_FILE"

docker compose -f $COMPOSE_FILE --project-name $PROJECT_NAME up --build --abort-on-container-exit
