const log4js = require('log4js');

exports.logger = function(name){
  log4js.configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: 'logs/listener.log' }
    },
    categories: {
      default: { appenders: [ 'out', 'app' ], level: 'debug' }
    }
  });

  var logger = log4js.getLogger(name);
  return logger;
};