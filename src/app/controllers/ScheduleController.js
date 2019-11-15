const {startOfDay, endOfDay, parseISO} = require('date-fns')
const {Op} = require('sequelize')
const Schedule = require('../models/Appointment')
const User = require('../models/User')

class ScheduleController{
    async index(req, res){

        const checkProvider = await User.findOne({
            where: {id: req.userId, provider:true}
        })

        if (!checkProvider){
            return res.status(401).json({error: "User is not provider"})
        }

        const {date} = req.query
        const parseDate = parseISO(date)
        
        const schedules = await Schedule.findAll({where: {
            provider_id: req.userId, 
            canceled_at: null, 
            date:{
                [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)]
            }
        }})

        return res.json(schedules)
    }
}

module.exports = new ScheduleController()