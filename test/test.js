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
      msgRepo.addPendingMsg('Bowen', 'Jue', {text : 'hello', timestamp : 123456})
      msgRepo.addPendingMsg('Bowen', 'Jue', {text : 'bye', timestamp : 1234578})
      let count = await msgRepo.getPendingMsgCount('Bowen', 'Jue')
      let msgs = await msgRepo.getMsgsby('Bowen', 'Jue')
      assert.equal(count, 2);
      assert.equal(JSON.stringify(msgs), JSON.stringify([{text : 'hello', timestamp : 123456}, {text : 'bye', timestamp : 1234578}]));
    });
  });
});