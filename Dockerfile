FROM node:24-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

CMD ["npm", "start"]
