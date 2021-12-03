FROM node:14.17.6

WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
RUN npm install -g nodemon


