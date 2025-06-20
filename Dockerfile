# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json only (no package-lock.json)
COPY package.json ./

# Install dependencies with npm install (not npm ci)
RUN npm install --production --no-package-lock

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "app.js"] 