#!/bin/bash

# https://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl
openssl req -x509 -newkey rsa:4096 -keyout scripts/sslcert/key.pem -out scripts/sslcert/cert.pem -subj '/CN=localhost' -days 3650 -nodes
