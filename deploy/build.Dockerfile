FROM node:lts-alpine as build

ARG NPM_REGISTERY="--registry=https://registry.npm.taobao.org"

WORKDIR /app
COPY package*.json ./
RUN npm clean-install --loglevel info ${NPM_REGISTERY}

COPY . .
RUN npm run build

VOLUME [ "/app/tmp/history" ]
CMD npm run build_history
