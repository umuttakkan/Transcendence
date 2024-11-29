#!/bin/bash

mkdir -p /etc/nginx/ssl

if [ ! -f /etc/nginx/ssl/nginx.crt ]; then
    openssl req \
    -newkey rsa:2048 \
    -nodes \
    -keyout /etc/nginx/ssl/nginx.key \
    -x509 \
    -days 365 \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=TR/ST=KOCAELI/L=GEBZE/O=42Kocaeli/CN=transcendence.42.fr";
fi

nginx -g "daemon off;"
