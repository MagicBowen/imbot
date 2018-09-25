const postJson = require('./post-json')
const config = require('../config')
const accessTocken = require('./access-tocken')
const seeds = require('../models/seed-repo')
const logger = require('../utils/logger').logger('template-msg')


async function sendTemplateMsg(fromUserId, toUserId, msg) {
    const tocken = await accessTocken.getTocken()
    const url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + tocken
    const seed = seeds.getSeed(toUserId)
    if (!seed) {
        logger.error('send template msg error because of no seed for id ' + toUserId)
        throw {result : 'no seed for sending template msg'}
    }
    return await postJson(url,
                {
                    template_id: 'jGlP_HnrwRBot5E0_vJu3Y0J8KFgRFep8AEuQBwxUTg',
                    page: "index",
                    form_id: seed,
                    data: {
                        keyword1: {
                            value: "数学"
                        },
                        keyword2: {
                            value: "2015年01月05日"
                        },
                        keyword3: {
                            value: "12:00"
                        },
                        keyword4: {
                            value: "逸夫教学楼"
                        },
                        keyword5: {
                            value: "401"
                        }
                    },
                    emphasis_keyword: "keyword1.DATA",
                    touser: toUserId
                }
        )
}

module.exports.send = sendTemplateMsg
