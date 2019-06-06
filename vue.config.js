module.exports = {
    devServer: {
        port: 6789,
        disableHostCheck: true,
        proxy: {
            '/api/v1/image': {
                target: 'http://127.0.0.1:6786',
            },
            '/api': {
                target: 'http://127.0.0.1:6788',
            },
            '/static': {
                target: 'http://127.0.0.1:6788',
            },
        }
    },
}