# Base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application files to the container
COPY . .

# Build the application
RUN pnpm run build

# Expose the port
EXPOSE 3000
# Start the application
CMD ["pnpm", "run", "preview"]