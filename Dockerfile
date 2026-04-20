# Stage 1: Build the Angular application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application using Node.js SSR
FROM node:22-alpine

WORKDIR /app

# Copy the build output from the build stage
# Angular 19+ SSR output is in dist/app
COPY --from=build /app/dist/app ./dist/app
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Cloud Run expects the app to listen on the port defined by the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Start the server
# The entry point of the Angular SSR server is usually dist/app/server/server.mjs
CMD ["node", "dist/app/server/server.mjs"]
