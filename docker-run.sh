#!/bin/bash
echo "HOST_IP=$(hostname -I | awk '{print $1}')" > .env
docker-compose up --build