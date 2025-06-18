FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000

ENV CHOKIDAR_USEPOLLING=true
ENV HOST=0.0.0.0

CMD ["npm", "start"]
