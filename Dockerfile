# Use Node.js 20 Alpine for smaller size
FROM node:20-alpine

# Install minimal dependencies for sharp (image processing)
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Enable corepack for Yarn
RUN corepack enable

# Copy package files and yarn configuration first for better caching
COPY package.json yarn.lock* ./
COPY .yarnrc.yml ./

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN yarn build

# Expose port
EXPOSE 3020

# Start the application
CMD ["yarn", "start"]