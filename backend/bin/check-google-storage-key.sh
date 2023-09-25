#!/bin/sh

if [ ! -f /app/src/config/keys.json ]; then
  echo "File backend/src/config/keys.json does not exist. Please create it."
  exit 1
fi