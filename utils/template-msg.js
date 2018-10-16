const postJson = require('./post-json')

async function sendTemplateMsg(msg, seed) {
    const url = msg.templateUrl
    const result = await postJson(url,
        {
            formId: seed,
            fromUserId: msg.fromUserId,
            toUserId: msg.toUserId,
            msg: msg.msg
        })
    return result
}

module.exports.send = sendTemplateMsg
