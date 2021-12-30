FROM nginx:stable-alpine
COPY deploy/envsub-njs.sh /usr/local/bin/envsub-njs
RUN chmod +x /usr/local/bin/envsub-njs && \
    echo '/usr/local/bin/envsub-njs /etc/nginx/nginx.conf' \
        > /docker-entrypoint.d/01-envsub-njs-nginx.sh && \
    chmod +x /docker-entrypoint.d/01-envsub-njs-nginx.sh
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/history/merged /usr/share/nginx/html
EXPOSE 80
