# Use a Node image with build tools
FROM node:20-slim

# Install dependencies for Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libgconf-2-4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxshmfence1 \
    libglu1-mesa \
    fonts-liberation \
    libappindicator3-1 \
    lsb-release \
    xdg-utils \
    libcurl4 \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Environment Variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (for faster rebuilds)
COPY package*.json ./
RUN npm install

# Build the frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3099

# Start the application
CMD [ "node", "index.js" ]
