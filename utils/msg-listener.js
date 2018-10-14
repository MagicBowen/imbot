const redis = require('../models/redis-client')
const TemplateMsg = require('../utils/template-msg')
const config = require('../config')
const {promisify} = require('util')
const Timestamp = require('../utils/timestamp')
const logger = require('../utils/period-logger').logger('msg-listener')

const MSG_LISTENER_QUEUE_NAME = 'MsgListenerQueue'

class MsgListener {
    constructor() {
        this.client = redis.client
        this.timers = {}
    }

    async run() {
        while(true) {
            await this.handleMsgArrival()
        }
    }

    async handleMsgArrival() {
        let result = await redis.cmd.blpop(MSG_LISTENER_QUEUE_NAME, 1)
        if (!result) return
        let msg = JSON.parse(result[1])
        logger.debug(`handle msg arrived : ${JSON.stringify(msg)}`)
        if (!this.timers[msg.toUserId]){
            this.setTimerForNewMsg(msg.fromUserId, msg.toUserId, msg.data)
        }
    }

    setTimerForNewMsg(fromUserId, toUserId, msg) {
        let that = this
        let timer = setTimeout(async function() {
            try {
                if(await redis.cmd.llen(that.getMsgQueueName(fromUserId, toUserId)) > 0) {
                    const result = await TemplateMsg.send(fromUserId, toUserId, msg)
                    logger.debug('send template msg when timeout, result is ' + JSON.stringify(result))
                } else {
                    logger.debug(`template msg (from ${fromUserId} to ${toUserId}) canceled because of no pendding msg in queue`)
                }
            } catch (err) {
                logger.error(`send template msg error, because of ${JSON.stringify(err)}`)
            } finally {
                that.timers[toUserId] = null
            }
        }, config.msg_notify_wait_second * 1000)

        this.timers[toUserId] = timer
        logger.debug(`set timer for new msg of user ${toUserId}`)
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