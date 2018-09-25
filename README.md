IMBOT

## api

host : https://xiaodamp.cn/api/imbot

### 'GET /openid'

获取微信openId

- parameters
    - code    

### 'POST /template_msg'

测试接口，发送模板消息

- parameters
    - { openId : 'xxxxx' }

### 'POST /form_id'

提交form_id，用于发送模板消息

- parameters
    - { openId : 'xxxxx', formId : '111111' }

### 'GET | POST /wechat/customer'

微信后台消息推送服务器接口，用于绑定客服消息服务器地址用

### 'GET /pending_count'

获取从fromUserId发往toUserId当前未处理的消息数

- parameters
    - fromUserId
    - toUserId

- result
    - {count : 2} 

### 'GET /pending_count_list'

获取指定用户当前所有未处理的消息数列表

- parameters
    - userId

- result
    - [{"fromUserId":"Macheal","timestamp":1234578,"count":1},{"fromUserId":"Bowen","timestamp":1234567,"count":2}]

### 'GET /pending_msgs'

获取指定用户当前未处理的所有消息

- parameters
    - fromUserId
    - toUserId

- result
    - {msgs : []}

### 'POST /msg'

发送消息

- parameters

```js
{
    fromUserId : "Bowen", 
    toUserId : "Joe", 
    msg : {
        type : "text",      // text  | image
        reply : "hello",     // reply | url
        timestamp : 1537606347 // UTC timestamp, unit : second
    }
}
```

### 'POST /image'

上传图片

- parameters
    - upload : files.image

- result
    - {url : 'image/xxxxxx.jpg'}

### 'POST /audio'

上传音频

- parameters
    - upload : files.audio

- result
    - {url : 'audio/xxxxxx.jpg'}

### 'POST /vedio'

上传视频

- parameters
    - upload : files.vedio

- result
    - {url : 'vedio/xxxxxx.jpg'}

## environment

- install redis

```bash
$ wget http://download.redis.io/releases/redis-4.0.11.tar.gz
$ tar xzf redis-4.0.11.tar.gz
$ sudo mv redis-4.0.11 /usr/redis
$ cd /usr/redis
$ sudo make
$ sudo make install
```