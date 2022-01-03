/* eslint-disable no-console */
const path = require('path')
const http = require('http')
const express = require('express')
const proxy = require('http-proxy-middleware')
const proxyConfig = require('../vue.config.js').devServer.proxy

var app = express()

Object.keys(proxyConfig).forEach(function(subpath) {
  app.use(subpath, proxy(subpath, proxyConfig[subpath]))
})
app.use(express.static('dist'))

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
  res.sendFile(path.resolve('dist/index.html'))
})

var httpServer = http.createServer(app)

console.log('Listen HTTP: http://localhost:6789')
httpServer.listen(6789)
