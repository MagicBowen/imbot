const redis = require('./redis-client')
const TemplateMsg = require('../utils/template-msg')
const config = require('../config')
const {promisify} = require('util')
const Timestamp = require('../utils/timestamp')
const logger = require('../utils/logger').logger('msg-repo')

class MsgRepo {
    constructor() {
        this.client = redis.client
        this.timers = {}
    }

    async addPendingMsg(fromUserId, toUserId, msg) {
        this.client.rpush(this.getMsgQueueName(fromUserId, toUserId), JSON.stringify(msg))
        await this.onNewMsgArrived(fromUserId, toUserId, msg)
    }

    async getMsgsBy(fromUserId, toUserId) {
        let msgs = []
        const llenAsync = promisify(this.client.llen).bind(this.client)
        const lpopAsync = promisify(this.client.lpop).bind(this.client)
        let maxNum = 50
        while ((await llenAsync(this.getMsgQueueName(fromUserId, toUserId)) > 0) && (maxNum--)) {
            let msg = await lpopAsync(this.getMsgQueueName(fromUserId, toUserId))
            msgs.push(JSON.parse(msg))
        }

        await this.clearTimerForMsg(toUserId)

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

    async onNewMsgArrived(fromUserId, toUserId, msg) {
        logger.debug(`new msg arrived : ${fromUserId} to ${toUserId} of ${JSON.stringify(msg)}`)
        const getAsync = promisify(this.client.get).bind(this.client)
        const timestamp = await getAsync(this.getPendingMsgTimerKey(toUserId))
        if (!this.timers[toUserId]){
            this.setTimerForNewMsg(fromUserId, toUserId, msg, 1)
        }
    }

    setTimerForNewMsg(fromUserId, toUserId, msg, repeatCount) {
        let that = this
        let timer = setTimeout(async function() {
            try {
                const result = await TemplateMsg.send(fromUserId, toUserId, msg)
                logger.debug('send template msg when timeout, result is ' + JSON.stringify(result))
            } catch (err) {
                logger.error(`send template msg error, because of ` + err)
            } finally {
                that.setTimerForNewMsg(fromUserId, toUserId, msg, repeatCount * 2)
            }
        }, config.msg_notify_wait_second * 1000 * repeatCount)

        const now = Timestamp.now()
        this.timers[toUserId] = timer
        this.client.set(this.getPendingMsgTimerKey(toUserId), now)
        logger.debug(`set timer ${now} for new msg of user ${toUserId} on repeat count ${repeatCount}`)
    }

    async clearTimerForMsg(toUserId) {
        const getAsync = promisify(this.client.get).bind(this.client)
        if (this.timers[toUserId]) {
            clearTimeout(this.timers[toUserId])
            this.timers[toUserId] = null
            const timestamp = await getAsync(this.getPendingMsgTimerKey(toUserId))
            this.client.del(this.getPendingMsgTimerKey(toUserId))
            logger.debug(`clear timer ${timestamp} for user ${toUserId}`)
        }
    }

    getFromUserIdFromQueueName(queue) {
        return queue.split(':')[0]
    }

    getToUserIdFromQueueName(queue) {
        return queue.split(':')[1]
    }

    getMsgQueueName(fromUserId, toUserId) {
        return fromUserId + ':' + toUserId
    }

    getPendingMsgTimerKey(toId) {
        return 'timer_' + toId
    }
}

const msgs = new MsgRepo()

module.exports = msgs