const assert = require('assert');
const seeds = require('../models/msg-seed')

describe('MsgSeed', function () {
  describe('#msgSeed1', function () {
    it('should get the seed after seed been added', function () {
      seeds.addSeed('o2Yr80F10xpY5_hi6bzHm8B6Lywg', '123456')
      let s = seeds.getSeed('o2Yr80F10xpY5_hi6bzHm8B6Lywg')
      assert.equal(s, '123456');
    });
  });
});