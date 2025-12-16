# Use official Python slim image for a smaller footprint
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

RUN apt update && apt install -y \
    python3.11-dev \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 5000 for Flask
EXPOSE 7333

# Command to run the Flask app
CMD ["python", "app.py"]