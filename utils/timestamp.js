function getCurrentTimeStamp() {
    return Math.floor(Date.now() / 1000)
}

module.exports.now = getCurrentTimeStamp