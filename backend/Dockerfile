# 1. Use an official Node.js runtime as the base
FROM node:18-alpine

# 2. Create app directory inside the container
WORKDIR /usr/src/app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy the rest of your backend code
COPY . .

# 5. Expose the port your app runs on
EXPOSE 5000

# 6. The command to start your server
CMD ["node", "index.js"]