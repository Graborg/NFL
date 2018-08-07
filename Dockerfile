FROM node:9.4.0

WORKDIR /app
COPY /components /app/components  
COPY /pages /app/pages  
COPY /static /app/static  
COPY /plugins /app/plugins  
COPY /utils /app/utils  
COPY /adapters /app/adapters  
COPY /utils.js /app/utils.js  
COPY /assets /app/assets  
COPY /middleware /app/middleware  
COPY /serverMiddleware /app/serverMiddleware  

COPY .eslintrc.js /app/.eslintrc.js
COPY .babelrc /app/.babelrc
COPY package.json /app/package.json
RUN npm install --quiet
CMD [ "npm", "run", "dev" ]