const assert = require('assert');
const seedRepo = require('../models/seed-repo')
const msgRepo = require('../models/msg-repo')
const redis = require('../models/redis-client')

describe('repo', function () {
  describe('#seed-repo', function () {
    it('should get the seed after seed been added', async function () {
      seedRepo.addSeed('o2Yr80F10xpY5_hi6bzHm8B6Lywg', '123456')
      let s = await seedRepo.getSeed('o2Yr80F10xpY5_hi6bzHm8B6Lywg')
      assert.equal(s, '123456');
    });
  });
  describe('#msg-repo', function () {
    it('should get the msgs after msgs been added', async function () {
      await msgRepo.addPendingMsg('Bowen', 'Juo', {text : 'hello', timestamp : 123456})
      await msgRepo.addPendingMsg('Bowen', 'Juo', {text : 'bye', timestamp : 1234578})
      let count = await msgRepo.getPendingMsgCount('Bowen', 'Juo')
      let msgs = await msgRepo.getMsgsby('Bowen', 'Juo')
      assert.equal(count, 2);
      assert.equal(JSON.stringify(msgs), JSON.stringify([{text : 'hello', timestamp : 123456}, {text : 'bye', timestamp : 1234578}]));
    });
    it('should get the counts after msgs been added', async function () {
      await msgRepo.addPendingMsg('Bowen', 'Darwin', {text : 'hello', timestamp : 123456})
      await msgRepo.addPendingMsg('Macheal', 'Darwin', {text : 'bye', timestamp : 1234578})
      await msgRepo.addPendingMsg('Bowen', 'Darwin', {text : 'hi', timestamp : 1234567})
      let result = await msgRepo.getPendingCountList('Darwin')
      await msgRepo.getMsgsby('Bowen', 'Darwin')
      await msgRepo.getMsgsby('Macheal', 'Darwin')

      const expect = [{fromUserId : 'Macheal', count : 1, timestamp : 1234578},
                      {fromUserId : 'Bowen', count : 2, timestamp : 1234567}]
      assert.equal(JSON.stringify(result), JSON.stringify(expect))
    });
  });
});