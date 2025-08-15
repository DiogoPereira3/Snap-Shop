# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run the frontend dev server
CMD ["npm", "run", "dev", "--host"]
