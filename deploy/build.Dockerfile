FROM node:lts-alpine as build

ARG NPM_REGISTERY="--registry=https://registry.npmmirror.com"

WORKDIR /app
COPY package*.json ./
RUN npm clean-install --no-audit --loglevel info ${NPM_REGISTERY}

# Ignore Browserslist: caniuse-lite is outdated
ENV BROWSERSLIST_IGNORE_OLD_DATA=1
COPY . .
RUN npm run build

VOLUME [ "/app/tmp/history" ]
CMD npm run build_history
