# PROD CONFIG
FROM node:alpine

RUN mkdir -p usr/src/app
WORKDIR usr/src/app

ARG NODE_ENV=development
ARG PORT=3000
ENV PORT=$PORT

COPY package*.json ./

RUN npm install && npm update

COPY . /usr/src/app

ENV NODE_ENV=production

EXPOSE $PORT

CMD [ "npm", "start" ]


