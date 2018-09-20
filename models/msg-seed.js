class MsgSeed {
    constructor() {
        this.seeds = {}
    }

    addSeed(id, seed) {
        if (!this.seeds[id]) {
            this.seeds[id] = []
        }
        this.seeds[id].push({seed : seed, timestamp : this.getCurrentTimeStamp()})
        console.log(JSON.stringify(this.seeds))
    }

    getSeed(id) {
        console.log(JSON.stringify(this.seeds))
        console.log(JSON.stringify(this.seeds[id]))
        if (!this.seeds[id]) {
            console.log('no seed for id ' + id)
            return null
        }

        while (this.seeds[id].length > 0) {
            let seed = this.seeds[id].pop()
            if (this.isExpired(seed)) {
                console.log('expired seed for id ' + id)
                continue
            }
            return seed.seed
        }

        console.log('not found seed for id ' + id)
        return null
    }

    isExpired(seed) {
        return ((this.getCurrentTimeStamp() - seed.timestamp) > (7 * 24 * 3600 - 1000))
    }

    getCurrentTimeStamp() {
        return Math.floor(Date.now() / 1000)
    }
}

const seeds = new MsgSeed()

module.exports = seeds