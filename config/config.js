let path = require("path");

const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        root: rootPath,
        app: {
            name: "rippal-server"
        },
        port: 3026,
        db: 'mongodb://localhost:26017/rippal-dev',
        name: 'rippal-dev',
        storage: rootPath + '/data/db-development'
    },

    test: {
        root: rootPath,
        app: {
            name: "rippal-server"
        },
        port: 3026,
        db: 'mongodb://localhost:26017/rippal-test',
        name: 'rippal-test',
        storage: rootPath + '/data/db-test'
    },

    production: {
        root: rootPath,
        app: {
            name: "rippal-server"
        },
        port: 3026,
        db: 'mongodb://localhost:26017/rippal-prod',
        name: 'rippal-prod',
        storage: rootPath + '/data/db-production'
    }
}

module.exports = config[env]