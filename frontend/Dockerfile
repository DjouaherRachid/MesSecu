FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

# PAS besoin de COPY . . car le code est monté via volumes

EXPOSE 3000

ENV CHOKIDAR_USEPOLLING=true
ENV HOST=0.0.0.0

CMD ["npm", "start"]
