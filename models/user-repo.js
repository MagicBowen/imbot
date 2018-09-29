const logger = require('../utils/logger').logger('mongo-user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('Users', new Schema({
    id: { type: String, unique: true, required: true},
    wechat: {
        nickName : String,
        gender   : String,
        avatarUrl: String
    }
}));

const User = mongoose.model('Users');

const model = {};

model.getUserBy = async (id) => {
    logger.debug(`Looking up user ${id}`);
    return await User.findOne({id : id}).exec();
};

model.addUser = async (user) => {
    const id = user.id
    const oriUser = await User.findOne({id : id}).exec();
    
    if (oriUser) {
        oriUser.set(user);
        await oriUser.save();
        logger.debug(`update user ${id} successful!`);
        return;
    }

    const newUser = new User(user);
    await newUser.save();
    logger.debug(`Add new user ${id}:${JSON.stringify(user)} successful!`);
}

model.getAllUsers = async () => {
    return await User.find().exec();
}

module.exports = model;