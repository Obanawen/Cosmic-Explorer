#!/bin/bash

# Get the current directory (where the script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Deploying from: $SCRIPT_DIR"

# Stop the container if it's running (suppress errors if it doesn't exist)
docker stop cky-grader || true

# Remove the container (suppress errors if it doesn't exist)
docker rm cky-grader || true

# Build a new Docker image
echo "Building Docker image..."
docker build -t cky-grader .

# Run the container with the specified port mapping
# Only use --env-file if .env.local exists
if [ -f .env.local ]; then
    echo "Starting container with environment file..."
    docker run -p 3020:3020 -d --name cky-grader --env-file .env.local cky-grader
else
    echo "Warning: .env.local not found. Running without environment file."
    docker run -p 3020:3020 -d --name cky-grader cky-grader
fi

echo "Container started successfully!"
echo "Application should be available at: http://localhost:3020"

# Exit the script
exit 