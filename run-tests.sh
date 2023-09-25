#!/bin/sh
docker compose -f docker-compose.test.yml --project-name prc-t up --build --abort-on-container-exit