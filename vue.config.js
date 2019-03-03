module.exports = {
    devServer: {
        port: 6789,
        proxy: {
            // proxy all requests starting with /api
            '/api': {
                target: 'http://127.0.0.1:6788',
            },
            '/accounts': {
                target: 'http://127.0.0.1:6788',
            },
        }
    },
}