const msgRepo = require('../models/msg-repo')
const PersistentMsgs = require('../models/persistent-msgs')
const logger = require('../utils/logger').logger('msg')

async function getPendingMsgs(ctx) {
    const fromUserId = ctx.query.fromUserId
    const toUserId = ctx.query.toUserId
    try {
        const msgs = await msgRepo.getMsgsBy(fromUserId, toUserId)
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = {msgs : msgs}
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('get pending msg error: ' + err)
    }
}

async function getPendingCount(ctx) {
    const fromUserId = ctx.query.fromUserId
    const toUserId = ctx.query.toUserId
    try {
        const count = await msgRepo.getPendingMsgCount(fromUserId, toUserId)
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = {count : count}
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('get pending count error: ' + err)
    }
}

async function getPendingCountList(ctx) {
    const userId = ctx.query.userId
    try {
        const count = await msgRepo.getPendingCountList(userId)
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = {count : count}
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('get pending count error: ' + err)
    }
}

async function sendMsg(ctx) {
    try {
        await msgRepo.addPendingMsg(ctx.request.body)
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = {result : 'success'};        
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('send msg error: ' + err) 
        logger.error(err.stack)  
    }
}

async function getMsgs(ctx) {
    const fromUserId = ctx.query.fromUserId
    const toUserId = ctx.query.toUserId
    const startTimeStamp = parseInt(ctx.query.startTimeStamp)
    const endTimeStamp = parseInt(ctx.query.endTimeStamp)
    try {
        const msgs = await PersistentMsgs.getMsgsBy(fromUserId, toUserId, startTimeStamp, endTimeStamp)
        ctx.response.type = "application/json"
        ctx.response.status = 200
        ctx.response.body = {msgs : msgs}
    } catch (err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404;
        ctx.response.body = {error : err}
        logger.error('get msgs error: ' + err)
    }    
}


module.exports = {
    'GET /pending_msgs' : getPendingMsgs,
    'GET /pending_count' : getPendingCount,
    'GET /pending_count_list' : getPendingCountList,
    'GET /msg'  : getMsgs,
    'POST /msg' : sendMsg
};