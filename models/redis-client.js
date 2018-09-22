const redis = require('redis')
const config = require('../config')
const logger = require('../utils/logger').logger('server');

const client = redis.createClient(config.redis_port, config.redis_host)

module.exports.client = client