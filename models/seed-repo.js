const redis = require('redis')
const config = require('../config')
const {promisify} = require('util');
const timestamp = require('../utils/timestamp')

class SeedRepo {
    constructor() {
        this.client = redis.createClient(config.redis_port, config.redis_host)
    }

    addSeed(id, seed) {
        this.client.rpush(id, JSON.stringify({seed : seed, timestamp : timestamp.now()}))
    }

    async getSeed(id) {
        if (this.client.llen(id) === 0) {
            return null
        }

        const lpopAsync = promisify(this.client.lpop).bind(this.client);

        while (this.client.llen(id) > 0) {
            let seed = await lpopAsync(id)
            seed = JSON.parse(seed)
            if (this.isExpired(seed)) {
                continue
            }
            return seed.seed
        }

        return null
    }

    isExpired(seed) {
        return ((timestamp.now() - seed.timestamp) > (7 * 24 * 3600 - 1000))
    }
}

const seeds = new SeedRepo()

module.exports = seeds