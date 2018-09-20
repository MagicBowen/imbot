const axios = require('axios');
const config = require('../config');
const accessTocken = require('../utils/access-tocken');
const logger = require('../utils/logger').logger('wechat');

async function getOpenId(ctx) {
    try {
        const result = await axios.get('https://api.weixin.qq.com/sns/jscode2session',
            {
                params: {
                    appid: config.appid,
                    secret: config.secret,
                    js_code: ctx.query.code,
                    grant_type: 'authorization_code'
                }
            }
        );
    
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = result.data;
    } catch(err) {
        ctx.response.status = 404;
        logger.error('get openid error: ' + err);
    }
}

async function sendTemplateMsg(ctx) {
    const tocken = await accessTocken.getTocken();
    const url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + tocken;

    try {
        const result = await axios.post(url,
            {
                params: {
                    template_id: 'jGlP_HnrwRBot5E0_vJu3Y0J8KFgRFep8AEuQBwxUTg',
                    page: "index",
                    form_id: ctx.request.body.formId,
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
                    touser: 'o2Yr80OCnF1rMkmf6ss10aj3CzAw'
                }
            }
        );
    
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = result;
    } catch(err) {
        ctx.response.status = 404;
        logger.error('send template msg error: ' + err);
    }
}

module.exports = {
    'GET /openid' : getOpenId,
    'POST /template_msg' : sendTemplateMsg
};