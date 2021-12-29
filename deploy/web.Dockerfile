FROM nginx:stable-alpine
COPY deploy/envplate-nginx.sh /docker-entrypoint.d/01-envplate-nginx.sh
RUN chmod +x /docker-entrypoint.d/01-envplate-nginx.sh
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/history/merged /usr/share/nginx/html
EXPOSE 80
