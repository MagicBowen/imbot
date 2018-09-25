const redis = require('./redis-client')
const {promisify} = require('util')

class MsgRepo {
    constructor() {
        this.client = redis.client
    }

    addPendingMsg(fromUserId, toUserId, msg) {
        this.client.rpush(this.getMsgQueueName(fromUserId, toUserId), JSON.stringify(msg))
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