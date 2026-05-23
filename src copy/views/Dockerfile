# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to cache dependencies layer
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Vite default development port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]