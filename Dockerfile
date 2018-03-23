FROM node:9.4.0

WORKDIR /app

COPY .eslintrc.js /app/.eslintrc.js
COPY .babelrc /app/.babelrc
COPY package.json /app/package.json
RUN npm install --quiet

