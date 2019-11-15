const Appointment = require('../models/Appointment')
const {startOfHour, parseISO, isBefore, format, subHours} = require('date-fns')
const pt = require('date-fns/locale/pt')
const User = require('../models/User')
const File = require('../models/File')
const Yup = require('yup')
const Notification = require('../schemas/Notification')
const Queue = require('../../lib/Queue')
const cancelationMail = require('../jobs/CancellationMail')

class AppointmentController{

    async index(req, res){
        const {page = 1} = req.query

        const appointments = await Appointment.findAll({where:
            {user_id: req.userId, canceled_at: null},
            order:['date'],
            attributes:['id', 'date', 'past', 'cancelable'],
            //paginação
            limit: 2, //limite por page
            offset: (page - 1)* 2, //cálculo para mostrar por página (2, 5, 10, 20) 
            include:[
                {
                    model: User,
                    as: 'provider',
                    attributes:['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes:['id', 'path','url']
                        }
                    ]
                }
            ]
        })

            return res.send(appointments)
    }

    async store(req, res){

        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required()
        })

        if (!(await schema.isValid(req.body))) {
            return res.json({error: "Validation Fails"})
        }

        const {provider_id, date} = req.body

        //converte date para obj date do JS e deixa a hr redonda. Ex: 9:30 -> 9:00
        const hourStart = startOfHour(parseISO(date))

        if(isBefore(hourStart, new Date())){
            return res.status(400).json({error: "Past dates are not permitted"})
        }

        const checkAvailibity = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart
            }
        })

        if (checkAvailibity){
            return res.status(400).json({error: "Appointment date is not available"})
        }

        //Check user provider
        const isProvider = await User.findOne({
            where: {id: provider_id, provider: true}
        })

        if(!isProvider){
            res.status(401).json({error: "You can only create appointments with providers"})
        }

        if(provider_id == req.userId){
            return res.status(400).json({error: "Can't schedule appointment for yourself"})
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date
        })

        //notify provider

        const {name} = await User.findByPk(req.userId)
        const formatDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h'",
            {locale: pt}
        )

        await Notification.create({
            content: `Novo agendamento de ${name} para o ${formatDate}`,
            user: provider_id
        })

        return res.json(appointment)
    }

    async delete(req, res){
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'email']
                },
                {
                    model: User,
                    as:'user',
                    attributes:['name']
                }
            ]
        })

        if(appointment.user_id != req.userId){
            return res.status(401)
            .json({error:"You don't have permission to cancel this appointment"})
        }

        const dateWidthSub = subHours(appointment.date, 2)

        if(isBefore(dateWidthSub, new Date())){
            return res.status(401)
            .json({error: "You can only cancel appointments 2 hours in advance."})
        }

        appointment.canceled_at = new Date()

        await appointment.save()

        await Queue.add(cancelationMail.key, {
            appointment
        })
        
        return res.json(appointment)
    }
}

module.exports = new AppointmentController()