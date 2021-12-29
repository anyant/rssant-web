FROM nginx:stable-alpine
# https://mirrors.ustc.edu.cn/help/alpine.html
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
# RUN apk add curl && curl -sLo /usr/local/bin/ep https://github.com/kreuzwerker/envplate/releases/download/v0.0.8/ep-linux && chmod +x /usr/local/bin/ep
COPY deploy/ep-linux /usr/local/bin/ep
RUN chmod +x /usr/local/bin/ep
COPY deploy/history/merged /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["/usr/local/bin/ep", "-v", "/etc/nginx/nginx.conf", "--", "/usr/sbin/nginx", "-g", "daemon off;"]
