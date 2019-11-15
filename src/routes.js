const { Router } = require("express")
const UserController = require('./app/controllers/UserController')
const SessionController = require('./app/controllers/SessionController')
const ProviderController = require('./app/controllers/ProviderController')
const FileController = require('./app/controllers/FileController')
const Appointments = require('./app/controllers/AppointmentController')
const ScheduleController = require('./app/controllers/ScheduleController')
const NotificationController = require('./app/controllers/NotificationController')
const AvailableController = require('./app/controllers/AvailableController')
const authMiddleware = require('./app/middlewares/auth')

const multer = require('multer')
const multerConfig = require('./config/multer')
const uploads = multer(multerConfig)

const routes = Router()

routes.post('/sessions', SessionController.store)
routes.post('/users', UserController.store)

routes.use(authMiddleware)

routes.put('/users', UserController.update)

routes.get('/providers', ProviderController.index)
routes.get('/providers/:providerId/available', AvailableController.index)

routes.get('/appointments', Appointments.index)
routes.post('/appointments', Appointments.store)
routes.delete('/appointments/:id', Appointments.delete)

routes.get('/schedule', ScheduleController.index)

routes.get('/notifications', NotificationController.index)
routes.put('/notifications/:id', NotificationController.update)

routes.post('/files', uploads.single('file'), FileController.store)

module.exports = routes