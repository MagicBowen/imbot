const postJson = require('./post-json')

async function sendTemplateMsg(msg, seed) {
    const url = msg.templateUrl
    if (!url) {
        throw ('msg without url when sending template msg')
    }
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
