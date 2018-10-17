IMBOT

## api

host : https://xiaodamp.cn/api/imbot

### 'GET /openid'

获取微信openId

- parameters
    - code    

### 'POST /user'

上传或者修改user信息

- parameters

```json
{
	"id" : "ob124wev23435234cdfd34",
    "wechat" : {
    	"nickName" : "franck",
    	"gender" : "female",
    	"avatarUrl" : "http://profile1.png"
    }
}
```

### 'GET user'

根据ID获取user信息

- parameters
    - id : user的id

- result

```json
{
    "id" : "ob124wev23435234cdfd34",
    "role" : "B",  // B | C
    "wechat" : {
    	"nickName" : "franck",
    	"gender" : "female",
    	"avatarUrl" : "http://profile1.png"
    }
}
```

### 'GET users'

获取所有user信息列表


### 'POST /template_msg'

测试接口，发送模板消息

```js
{
    formId:'',                // 用于发送模板消息的formId
    fromUserId: '',           // 发送者openId
    toUserId: '',             // 接收者openId
    msg:{                     // 触发模板消息的消息
        type: '',             // text || image
        reply: '',            // text消息的内容 || image的URL
        timestamp: ''         // 时间戳（ms）
    }
}
```

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
    fromUserId  : "Bowen", 
    toUserId    : "Joe",
    templateUrl : 'https://xiaodamp.com/imbot/template_msg', // 触发模板消息时的回调地址，参见'POST /template_msg'接口
    msg : {
        type  : "text",      // text | image
        reply : "hello",     // reply | url
        timestamp : 1537606347 // UTC timestamp, unit : ms
    }
}
```

### 'GET /msg'

查询历史消息

- parameters
    - fromUserId
    - toUserId
    - startTimeStamp : 消息的开始时间，包含
    - endTimeStamp ： 消息的结束时间，不包含

- result
    - {msgs : []}

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

### 'POST /video'

上传视频

- parameters
    - upload : files.video

- result
    - {url : 'video/xxxxxx.jpg'}

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