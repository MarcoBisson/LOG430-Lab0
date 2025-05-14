# Base Python image
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy files to container
COPY . .

# Expose the port
EXPOSE 8000

# Define the entrypoint for the application
CMD ["python", "main.py"]