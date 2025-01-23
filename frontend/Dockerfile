FROM node:17-alpine

WORKDIR /app

COPY package.json .

RUN npm install socket.io-client --save && typings install dt~socket.io-client --save --global && npm install --legacy-peer-deps --save-dev web-vitals

COPY . .

EXPOSE 3000

CMD ["npm", "start"]