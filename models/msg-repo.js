const redis = require('./redis-client')
const TemplateMsg = require('../utils/template-msg')
const config = require('../config')
const {promisify} = require('util')

class MsgRepo {
    constructor() {
        this.client = redis.client
    }

    addPendingMsg(fromUserId, toUserId, msg) {
        this.client.rpush(this.getMsgQueueName(fromUserId, toUserId), JSON.stringify(msg))
        this.onNewMsgArrived(fromUserId, toUserId, msg)
    }

    async getMsgsby(fromUserId, toUserId) {
        let msgs = []
        const llenAsync = promisify(this.client.llen).bind(this.client)
        const lpopAsync = promisify(this.client.lpop).bind(this.client)
        let maxNum = 50
        while ((await llenAsync(this.getMsgQueueName(fromUserId, toUserId)) > 0) && (maxNum--)) {
            let msg = await lpopAsync(this.getMsgQueueName(fromUserId, toUserId))
            msgs.push(JSON.parse(msg))
        }

        this.clearTimerForMsg(toUserId)

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

    onNewMsgArrived(fromUserId, toUserId, msg) {
        const getAsync = promisify(this.client.get).bind(this.client)
        const timerId = getAsync(this.getPendingMsgTimerKey(toUserId))
        if (!timerId) {
            this.setTimerForNewMsg(fromUserId, toUserId, msg)
        }
    }

    setTimerForNewMsg(fromUserId, toUserId, msg) {
        let timer = setTimeout(function() {
            try {
                const result = TemplateMsg.send(fromUserId, toUserId, msg)
                logger.info('send template msg when timeout, result is ' + result)
            } catch (err) {
                logger.error(`send template msg error, because of ` + err)
                this.setTimerForNewMsg(fromUserId, toUserId, msg)
            }
        }, config.msg_notify_wait_second * 1000)
        this.client.set(this.getPendingMsgTimerKey(toUserId), timer)
    }

    clearTimerForMsg(toUserId) {
        const timerId = this.getPendingMsgTimerKey(toUserId)
        const getAsync = promisify(this.client.get).bind(this.client)
        const timerId = getAsync(this.getPendingMsgTimerKey(toUserId))
        if (timerId) {
            clearTimeout(timerId)
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