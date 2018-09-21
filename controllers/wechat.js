const axios = require('axios');
const crypto = require('crypto');
const postJson = require('../utils/post-json')
const config = require('../config');
const accessTocken = require('../utils/access-tocken');
const seeds = require('../models/seed-repo')
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

function sha1(str) {
    var md5sum = crypto.createHash("sha1");
    md5sum.update(str);
    str = md5sum.digest("hex");
    return str;
}

async function getSignature(ctx) {
    var query = ctx.query;
    var signature = query.signature;
    var echostr = query.echostr;
    var nonce = query.nonce;
    var timestamp = query['timestamp'];
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = config.tocken;
    oriArray.sort();
    var original = oriArray.join('');
    var scyptoString = sha1(original);
    if (signature == scyptoString) {
        ctx.response.status = 200
        ctx.response.body = echostr
    } else {
        ctx.response.status = 404;
        ctx.response.body = "false"
    }
}

async function handleCustomerMsg(ctx) {  
    const tocken = await accessTocken.getTocken();
    const url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + tocken

    const msg = {
        touser  : ctx.request.body.FromUserName,
        msgtype : "text",
        text :
        {
             content : ctx.request.body.Content
        }
    }

    if ((ctx.request.body.MsgType == 'event') && (ctx.request.body.Event == 'user_enter_tempsession')) {
        msg.text.content = '欢迎访问客服'
    }

    await postJson(url, msg)
    ctx.response.type = "application/json"
    ctx.response.status = 200
    ctx.response.body = ''
}

async function saveFormIdForTemplateMsg(ctx) {
    const openId = ctx.request.body.openId
    const formId = ctx.request.body.formId
    seeds.addSeed(openId, formId)
    ctx.response.type = "application/json"
    ctx.response.status = 200
    ctx.response.body = {result : 'success'}
}

async function sendTemplateMsg(ctx) {
    const tocken = await accessTocken.getTocken();
    const url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + tocken;
    const openId = ctx.request.body.openId
    const seed = seeds.getSeed(openId)
    if (!seed) {
        ctx.response.status = 404;
        ctx.response.body = {result : 'no seed for sending template msg'}
        logger.error('send template msg error because of no seed for id ' + openId)
        return
    }
    try {
        const result = await postJson(url,
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
                    touser: openId
                }
        );
    
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = result
    } catch(err) {
        ctx.response.status = 404
        ctx.response.body = err
        logger.error('send template msg error: ' + err)
    }
}

module.exports = {
    'GET /openid' : getOpenId,
    'POST /template_msg' : sendTemplateMsg,
    'POST /form_id' : saveFormIdForTemplateMsg,
    'GET /wechat/customer' : getSignature,
    'POST /wechat/customer' : handleCustomerMsg
};