const MsgListener = require('./utils/msg-listener')
const logger = require('./utils/listener-logger').logger('msg-listener')

MsgListener.listener.run()
logger.info('Msg Listener Startup...')