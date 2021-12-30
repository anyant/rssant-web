FROM nginx:stable-alpine
COPY deploy/envsub-njs.sh /usr/local/bin/envsub
RUN chmod +x /usr/local/bin/envsub && \
    echo '/usr/local/bin/envsub /etc/nginx/nginx.conf' \
        > /docker-entrypoint.d/01-envsub-nginx.sh && \
    chmod +x /docker-entrypoint.d/01-envsub-nginx.sh
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/history/merged /usr/share/nginx/html
EXPOSE 80
