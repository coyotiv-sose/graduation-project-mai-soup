#!/bin/sh
if [ -z "$VITE_MAPBOX_TOKEN" ]; then
  echo "Missing required API keys. Please set all required environment variables."
  exit 1
fi

exec npm run dev