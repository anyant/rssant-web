FROM node:16-alpine AS build

ARG NPM_REGISTERY="--registry=https://registry.npmmirror.com"

WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm clean-install --no-audit --verbose ${NPM_REGISTERY}

# Ignore Browserslist: caniuse-lite is outdated
ENV BROWSERSLIST_IGNORE_OLD_DATA=1
COPY . .
RUN npm run build

VOLUME [ "/app/tmp/history" ]
CMD ["npm", "run", "build_history"]
