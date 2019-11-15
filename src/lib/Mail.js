const nodeMailer = require('nodemailer')
const mailConfig = require('../config/mail')
const exphbs = require('express-handlebars')
const nodemailerhbs = require('nodemailer-express-handlebars')
const {resolve} = require('path')

class Mail{
    constructor(){
        const {host, auth, secure, port} = mailConfig

        this.transporter = nodeMailer.createTransport({
            host,
            port, 
            secure,
            auth: auth.user ? auth : null 
        })

        this.configTemplate()
    }

    //template para envio de e-mail quando cancelar
    configTemplate(){
        const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails')

        this.transporter.use('compile', nodemailerhbs({
            viewEngine: exphbs.create({
                layoutsDir: resolve(viewPath, 'layouts'),
                partialsDir: resolve(viewPath, 'partials'),
                defaultLayout: 'default',
                extname: '.hbs'
            }),
            viewPath,
            extName: '.hbs',
        }))
    }
    
    sendMail(message){
        return this.transporter.sendMail({
            ...mailConfig.default, ...message
        })
    }
}

module.exports = new Mail()