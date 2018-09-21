const assert = require('assert');
const seeds = require('../models/seed-repo')

describe('MsgSeed', function () {
  describe('#msgSeed1', function () {
    it('should get the seed after seed been added', async function () {
      seeds.addSeed('o2Yr80F10xpY5_hi6bzHm8B6Lywg', '123456')
      let s = await seeds.getSeed('o2Yr80F10xpY5_hi6bzHm8B6Lywg')
      assert.equal(s, '123456');
    });
  });
});