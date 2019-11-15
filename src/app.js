const express = require('express');
const routes = require('./routes');
const path = require('path')

const database = require('./database')

class App {
    constructor() {
        this.server = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.server.use(express.json());
        //servindo arquivos estaticos para visualizar
        this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
    }

    routes() {
        this.server.use(routes);
    }
}

module.exports = new App().server;

