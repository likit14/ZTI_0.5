# Use the official Python base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt /app/

# Install system dependencies (e.g., for tail, which needs `grep`)
RUN apt-get update && apt-get install -y grep && apt-get clean

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code (server.py) into the container's /app directory
COPY server.py /app/

# Expose the port the app will run on
EXPOSE 5055

# Run the Flask app
CMD ["python", "server.py"]

