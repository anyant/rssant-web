FROM node:lts-alpine as build

ARG NPM_REGISTERY="--registry=https://registry.npm.taobao.org"

WORKDIR /app
COPY package*.json ./
RUN npm install --loglevel info ${NPM_REGISTERY}
COPY . .
RUN npm run build

FROM nginx:stable-alpine as prod
# https://mirrors.ustc.edu.cn/help/alpine.html
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
# RUN apk add curl && curl -sLo /usr/local/bin/ep https://github.com/kreuzwerker/envplate/releases/download/v0.0.8/ep-linux && chmod +x /usr/local/bin/ep
COPY extra/ep-linux /usr/local/bin/ep
RUN chmod +x /usr/local/bin/ep
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["/usr/local/bin/ep", "-v", "/etc/nginx/nginx.conf", "--", "/usr/sbin/nginx", "-g", "daemon off;"]
