const redis = require('./redis-client')
const {promisify} = require('util')
const logger = require('../utils/logger').logger('msg-repo')

const MSG_LISTENER_QUEUE_NAME = 'MsgListenerQueue'

class MsgRepo {
    constructor() {
        this.client = redis.client
        this.timers = {}
    }

    async addPendingMsg(msg) {
        this.client.rpush(this.getMsgQueueName(msg.fromUserId, msg.toUserId), JSON.stringify(msg.msg))
        await this.onNewMsgArrived(msg)
    }

    async getMsgsBy(fromUserId, toUserId) {
        let msgs = []
        const llenAsync = promisify(this.client.llen).bind(this.client)
        const lpopAsync = promisify(this.client.lpop).bind(this.client)
        while (await llenAsync(this.getMsgQueueName(fromUserId, toUserId)) > 0) {
            let msg = await lpopAsync(this.getMsgQueueName(fromUserId, toUserId))
            msgs.push(JSON.parse(msg))
        }

        // await this.clearTimerForMsg(toUserId)

        return msgs
    }

    async getPendingMsgCount(fromUserId, toUserId) {
        const llenAsync = promisify(this.client.llen).bind(this.client)
        return await llenAsync(this.getMsgQueueName(fromUserId, toUserId))
    }

    async getPendingCountList(userId) {
        const keysAsync = promisify(this.client.keys).bind(this.client)
        const llenAsync = promisify(this.client.llen).bind(this.client)
        const lindexAsync = promisify(this.client.lindex).bind(this.client)
        const toUserQueues = await keysAsync(`*:${userId}`)
        let result = []
        for (let queue of toUserQueues) {
            const length = await llenAsync(queue)
            if (length > 0) {
                const fromUserId = this.getFromUserIdFromQueueName(queue)
                let lastMsg = await lindexAsync(queue, -1)
                lastMsg = JSON.parse(lastMsg)
                result.push({fromUserId : fromUserId, count : await llenAsync(queue), timestamp : lastMsg.timestamp})
            }
        }
        return result.sort((a, b) => {return a.timestamp < b.timestamp})
    }

    async onNewMsgArrived(msg) {
        logger.info(`new msg arrived : ${msg.fromUserId} to ${msg.toUserId} of ${JSON.stringify(msg.msg)}`)
        this.client.rpush(MSG_LISTENER_QUEUE_NAME, JSON.stringify(msg))
    }

    // async onNewMsgArrived(fromUserId, toUserId, msg) {
    //     logger.debug(`new msg arrived : ${fromUserId} to ${toUserId} of ${JSON.stringify(msg)}`)
    //     if (!this.timers[toUserId]){
    //         this.setTimerForNewMsg(fromUserId, toUserId, msg, 1)
    //     }
    // }

    // setTimerForNewMsg(fromUserId, toUserId, msg, repeatCount) {
    //     let that = this
    //     let timer = setTimeout(async function() {
    //         try {
    //             const result = await TemplateMsg.send(fromUserId, toUserId, msg)
    //             logger.debug('send template msg when timeout, result is ' + JSON.stringify(result))
    //         } catch (err) {
    //             logger.error(`send template msg error, because of ` + err)
    //         } finally {
    //             that.timers[toUserId] = null
    //         }
    //         // finally {
    //         //     that.setTimerForNewMsg(fromUserId, toUserId, msg, repeatCount + 1)
    //         // }
    //     }, config.msg_notify_wait_second * 1000 * repeatCount)

    //     this.timers[toUserId] = timer
    //     logger.debug(`set timer for new msg of user ${toUserId} on repeat count ${repeatCount}`)
    // }

    // async clearTimerForMsg(toUserId) {
    //     const getAsync = promisify(this.client.get).bind(this.client)
    //     if (this.timers[toUserId]) {
    //         clearTimeout(this.timers[toUserId])
    //         this.timers[toUserId] = null
    //         logger.debug(`clear timer for user ${toUserId}`)
    //     }
    // }

    getFromUserIdFromQueueName(queue) {
        return queue.split(':')[0]
    }

    getToUserIdFromQueueName(queue) {
        return queue.split(':')[1]
    }

    getMsgQueueName(fromUserId, toUserId) {
        return fromUserId + ':' + toUserId
    }
}

const msgs = new MsgRepo()

module.exports = msgs