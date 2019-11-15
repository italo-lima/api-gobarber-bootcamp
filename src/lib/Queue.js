const Bee = require('bee-queue')
const CancellationMail = require('../app/jobs/CancellationMail')
const redisConfig = require('../config/redis')

const jobs = [CancellationMail]

class Queue{
    constructor(){
        this.queues = {}
        this.init()
    }

    init(){
        jobs.forEach(({key, handle}) => {
            this.queues[key] = {
                bee: new Bee(key, {
                    redis: redisConfig
                }),
                handle
            }
        })
    }

    add(queue, job){
        return this.queues[queue].bee.createJob(job).save()
    }

    processQueue(){
        jobs.forEach(job => {
            const {bee, handle} = this.queues[job.key]

            //.on('failed) -> fica monitorando a fila, caso encontre erro chama handleFailure
            bee.on('failed', this.handleFailure).process(handle)
        })
    }

    handleFailure(job, error){
        console.log(`Queue ${job.queue.name}: Failed`, error)
    }
}

module.exports = new Queue()