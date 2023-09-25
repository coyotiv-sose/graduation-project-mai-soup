#!/bin/sh
if [ -z "$MAPBOX_TOKEN" ] || [ -z "$OPENAI_API_KEY" || ]; then
  echo "Missing required API keys. Please set all required environment variables."
  exit 1
fi

if [ -z "$GCLOUD_PROJECT_ID" ] || [ -z "$GCLOUD_STORAGE_BUCKET" ]; then
  echo "Missing Google Cloud information. Please set all required environment variables."
  exit 1
fi

# run check-google-storage-key.sh and exit if it fails
if ! /app/bin/check-google-storage-key.sh; then
  exit 1
fi

exec npm run dev