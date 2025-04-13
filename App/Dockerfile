# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists) first to leverage Docker cache
COPY package.json ./
COPY package-lock.json* ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port 5173 for Vite dev server
EXPOSE 5173

# Command to run Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]