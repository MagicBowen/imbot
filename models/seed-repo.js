const redis = require('./redis-client')
const {promisify} = require('util')
const timestamp = require('../utils/timestamp')
const logger = require('../utils/logger').logger('seedRepo')

class SeedRepo {
    constructor() {
        this.client = redis.client
    }

    addSeed(id, seed) {
        this.client.rpush(this.getSeedQueueName(id), JSON.stringify({seed : seed, timestamp : timestamp.now()}))
        logger.debug(`add seed ${seed} to repo for user ${id}`)
    }

    async clear(id) {
        const llenAsync = promisify(this.client.llen).bind(this.client)
        const lpopAsync = promisify(this.client.lpop).bind(this.client)

        while (await llenAsync(this.getSeedQueueName(id)) > 0) {
            await lpopAsync(this.getSeedQueueName(id))
        }
    }

    async getSeed(id) {
        const llenAsync = promisify(this.client.llen).bind(this.client);
        if (await llenAsync(this.getSeedQueueName(id)) === 0) {
            return null
        }

        const lpopAsync = promisify(this.client.lpop).bind(this.client);
        while (await llenAsync(this.getSeedQueueName(id)) > 0) {
            let seed = await lpopAsync(this.getSeedQueueName(id))
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

    getSeedQueueName(id) {
        return 'seed_' + id
    }
}

const seeds = new SeedRepo()

module.exports = seeds