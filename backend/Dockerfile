
FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_OPTIONS="--max-old-space-size=256"


COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]