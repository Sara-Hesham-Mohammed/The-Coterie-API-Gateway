FROM node:23
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apt-get -y update; apt-get -y install curl
EXPOSE 3000
COPY . .
CMD ["node","index.js"]
 