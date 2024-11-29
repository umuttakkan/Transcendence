FROM nginx:latest

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /app/static

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf


COPY ./tools/nginx_start.sh  /

RUN chmod +x /nginx_start.sh

EXPOSE 443

ENTRYPOINT [ "/nginx_start.sh" ]

