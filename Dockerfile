FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/.env .env
COPY . .

ENV NODE_ENV=production
EXPOSE 5000
# CMD ["node", "index.js"]
CMD ["npm", "start"]