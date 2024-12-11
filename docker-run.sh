#!/bin/bash
set -x
echo "REACT_APP_HOST_IP=$(hostname -I | awk '{print $1}')" > .env
docker-compose up --build