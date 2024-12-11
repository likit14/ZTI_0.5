#!/bin/bash
set -x  # Enables debug output

# Get the host's IP and save it into a shell variable
HOST_IP=$(hostname -I | awk '{print $1}')

# Write the host IP to the .env file for React
echo "REACT_APP_HOST_IP=$HOST_IP" > .env

# Export the variable so it's available to Docker Compose
export HOST_IP=$HOST_IP

# Run Docker Compose, ensuring it picks up the exported variable
docker-compose up --build
