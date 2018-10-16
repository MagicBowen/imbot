const redis = require('../models/redis-client')
const TemplateMsg = require('../utils/template-msg')
const SeedRepo = require('../models/seed-repo')
const config = require('../config')
const logger = require('../utils/listener-logger').logger('msg-listener')

const MSG_LISTENER_QUEUE_NAME = 'MsgListenerQueue'

class MsgListener {
    constructor() {
        this.client = redis.client
        this.timers = {}
    }

    async run() {
        while(true) {
            logger.debug('Msg Listener Keep Alive...')
            await this.handleMsgArrival()
        }
    }

    async handleMsgArrival() {
        let result = await redis.cmd.blpop(MSG_LISTENER_QUEUE_NAME, 1)
        if (!result) return
        let msg = JSON.parse(result[1])
        logger.info(`handle msg arrived : ${JSON.stringify(msg)}`)
        if (!this.timers[msg.toUserId]){
            this.setTimerForNewMsg(msg)
        }
    }

    setTimerForNewMsg(msg) {
        let that = this
        let timer = setTimeout(async function() {
            try {
                if(await redis.cmd.llen(that.getMsgQueueName(msg.fromUserId, msg.toUserId)) > 0) {
                    const seed = await SeedRepo.getSeed(msg.toUserId)
                    if (!seed) {
                        logger.warn('send template msg with no seed for id ' + msg.toUserId)
                    }
                    const result = await TemplateMsg.send(msg, seed)
                    logger.info('send template msg when timeout, result is ' + JSON.stringify(result))
                } else {
                    logger.info(`template msg (from ${msg.fromUserId} to ${msg.toUserId}) canceled because of no pendding msg in queue`)
                }
            } catch (err) {
                logger.error(`send template msg error, because of ${JSON.stringify(err)}`)
            } finally {
                that.timers[msg.toUserId] = null
            }
        }, config.msg_notify_wait_second * 1000)

        this.timers[msg.toUserId] = timer
        logger.info(`set timer for new msg of user ${msg.toUserId}`)
    }

    async clearTimerForMsg(toUserId) {
        if (this.timers[toUserId]) {
            clearTimeout(this.timers[toUserId])
            this.timers[toUserId] = null
            logger.debug(`clear timer for user ${toUserId}`)
        }
    }

    getMsgQueueName(fromUserId, toUserId) {
        return fromUserId + ':' + toUserId
    }    
}

const listener = new MsgListener()

module.exports.listener = listener
module.exports.queueName = MSG_LISTENER_QUEUE_NAME