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
        let maxNum = 20
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

    getMsgQueueName(fromId, toId) {
        return fromId + ':' + toId
    }
}

const msgs = new MsgRepo()

module.exports = msgs