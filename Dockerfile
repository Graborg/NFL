FROM node:9

WORKDIR /app
COPY /components /app/components  
COPY /pages /app/pages  
COPY /.nuxt /app/.nuxt  
COPY /dist /app/dist  
COPY /static /app/static  
COPY /plugins /app/plugins  
COPY /utils.js /app/utils.js  
COPY /nuxt.config.js /app/nuxt.config.js  
COPY /assets /app/assets  

COPY .eslintrc.js /app/.eslintrc.js
COPY .babelrc /app/.babelrc
COPY package.json /app/package.json
RUN npm install --quiet

CMD npm start