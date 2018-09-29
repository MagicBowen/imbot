const logger = require('../utils/logger').logger('model');
var mongoose = require('mongoose');

module.exports.init = async () => {
    mongoose.connect('mongodb://localhost:27017/imbot');
    logger.info('Init mongo db model successful!');
}