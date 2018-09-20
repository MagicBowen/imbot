const timestamp = require('../utils/timestamp')

class MsgSeed {
    constructor() {
        this.seeds = {}
    }

    addSeed(id, seed) {
        if (!this.seeds[id]) {
            this.seeds[id] = []
        }
        this.seeds[id].push({seed : seed, timestamp : timestamp.now()})
    }

    getSeed(id) {
        if (!this.seeds[id]) {
            return null
        }

        while (this.seeds[id].length > 0) {
            let seed = this.seeds[id].pop()
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

const seeds = new MsgSeed()

module.exports = seeds