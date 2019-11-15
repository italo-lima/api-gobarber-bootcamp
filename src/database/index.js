const Sequelize = require('sequelize')
const databaseConfig = require("../config/database")
const User = require("../app/models/User")
const File = require("../app/models/File")
const Appointment = require("../app/models/Appointment")

const mongoose = require('mongoose')

const models = [User, File, Appointment]

class Database {
    constructor() {
        this.init()
        this.mongo()
    }

    init() {
        this.connection = new Sequelize(databaseConfig)

        models
        .map(model => model.init(this.connection))
        .map(model => model.associate && model.associate(this.connection.models)) //Associação entre id de file com user
    }

    mongo(){
        this.mongoConnection = mongoose.connect('mongodb://172.17.0.2:27017/goBarber',
        {useNewUrlParser: true, useFindAndModify: true}
        )
    }
}

module.exports = new Database()