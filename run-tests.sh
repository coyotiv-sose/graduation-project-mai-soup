#!/bin/sh
docker compose -f docker-compose.test.yml --project-name test up --build --abort-on-container-exit