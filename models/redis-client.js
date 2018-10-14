const redis = require('redis')
const config = require('../config')
const {promisify} = require('util')

const client = redis.createClient(config.redis_port, config.redis_host)

const commands = {
    llen : promisify(client.llen).bind(client),
    lpop : promisify(client.lpop).bind(client),
    blpop : promisify(client.blpop).bind(client),
    keys : promisify(client.keys).bind(client),
    lindex : promisify(client.lindex).bind(client),
    get : promisify(client.get).bind(client)
}

module.exports.client = client
module.exports.cmd = commands
