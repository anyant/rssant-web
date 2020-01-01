/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const proxy = require('http-proxy-middleware');
const proxyConfig = require('../vue.config.js').devServer.proxy;

var privateKey = fs.readFileSync('scripts/sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('scripts/sslcert/cert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var app = express();

Object.keys(proxyConfig).forEach(function (subpath) {
    app.use(subpath, proxy(subpath, proxyConfig[subpath]));
});
app.use(express.static('dist'));

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

console.log('Listen HTTP: http://localhost:6789')
httpServer.listen(6789);
console.log('Listen HTTPs: https://localhost:6783')
httpsServer.listen(6783);
