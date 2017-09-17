FROM node:latest

WORKDIR /app

COPY .eslintrc.js /app/.eslintrc.js
COPY package.json /app/package.json
RUN npm install --quiet

