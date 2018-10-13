const postJson = require('./post-json')
const config = require('../config')
const accessTocken = require('./access-tocken')
const seeds = require('../models/seed-repo')
const users = require('../models/user-repo')
const logger = require('../utils/logger').logger('template-msg')


async function sendTemplateMsg(fromUserId, toUserId, msg) {
    const tocken = await accessTocken.getTocken()
    const url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + tocken
    const seed = await seeds.getSeed(toUserId)
    if (!seed) {
        logger.error('send template msg error because of no seed for id ' + toUserId)
        throw {result : 'no seed for sending template msg'}
    }
    const user = users.getUserBy(fromUserId)
    const nickName = (user && user.wechat && user.wechat.nickName) ? user.wechat.nickName : '匿名'
    logger.debug(`send template msg from ${fromUserId} to ${toUserId} by formId ${seed} of msg ${JSON.stringify(msg)}`)
    const result = await postJson(url,
        {
            template_id: 'OE3Qo9tA7Z3qy3HWJTjkBKQ87jkaWVGDckzWeYN0Dvg',
            page: "pages/index/index",
            form_id: seed,
            data: {
                keyword1: {
                    value: nickName
                },
                // keyword2: {
                //     value: ""
                // },
                keyword3: {
                    value: (msg.type === 'text') ? msg.reply : '图片或多媒体类型'
                },
                keyword4: {
                    value: (new Date(msg.timestamp)).toLocaleString()
                }
            },
            emphasis_keyword: "keyword1.DATA",
            touser: toUserId
        }
        )
        return result
}

module.exports.send = sendTemplateMsg
