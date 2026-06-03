FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

COPY server.js ./

EXPOSE 8080

CMD ["npm", "start"]
