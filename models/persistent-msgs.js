const logger = require('../utils/logger').logger('mongo-msg');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('Msgs', new Schema({
    toUserId: { type: String, required: true, index: true},
    fromUserId : {type: String, required: true, index: true},
    msg: {type : Object, required: true}
}));

const Msg = mongoose.model('Msgs');

const model = {};

model.saveMsg = async (msg) => {
    const newMsg = new Msg()
    newMsg.fromUserId = msg.fromUserId
    newMsg.toUserId = msg.toUserId
    newMsg.msg = msg.msg
    await newMsg.save();
    logger.debug(`Add new msg ${JSON.stringify(msg)} to mongo db successful!`);
}

model.getMsgsBy = async (fromUserId, toUserId, startTimeStamp, endTimeStamp) => {
    // const condition = {'fromUserId' : fromUserId, 'toUserId' : toUserId, 'msg.timestamp' : {$gte : startTimeStamp,  $lt: endTimeStamp}}
    // const condition = {'fromUserId' : fromUserId, 'toUserId' : toUserId}
    const condition = {'fromUserId' : fromUserId, 'toUserId' : toUserId, 'msg.timestamp' : {$gte: startTimeStamp, $lt: endTimeStamp}}
    console.log(condition)
    return await Msg.find(condition).exec();
};

module.exports = model;