'use strict'
var mongoose = require('mongoose')
var User = mongoose.model('User')
var robot =require('../service/robot')
var uuid = require('uuid')
exports.signature = function *(next) {
    var body = this.request.body
    var cloud = body.cloud
    var token
    var key

    if (cloud === 'qiniu') {
        key = uuid.v4() + '.jpeg'
        var data = robot.getQiniuToken(body)
        
        token = data.token
        key = data.key
    }
    else {
        token = robot.getCloudinaryToken(body)
    }

    // 将加密后的签名值返回给客户端，客户端利用服务器端返回的签名值来上传图片
    this.body = {
        'success': true,
        'data': {
            token: token,
            key: key
        }
    }
}

exports.hasBody = function *(next) { // 创建中间件
    var body = this.request.body || {}
    console.log(1,body)
    console.log(Object.keys(body).length + 'Object.keys(body).length')
    if(Object.keys(body).length === 0) {
        this.body = {
            'success': false,
            'err': '数据丢失'
        }
        return next
    }

    yield next
}

exports.hasToken = function *(next) { // 创建中间件
    var accessToken = this.query.accessToken

    if(!accessToken) {
        accessToken  = this.request.body.accessToken
    }

    if(!accessToken) {
        this.body = {
            'success': true,
            'err': 'AccessToken 丢失'
        }
        return next
    }

    var user = yield User.findOne({
        'accessToken': accessToken
    }).exec()

    if(!user) {
        this.body = {
            'success': false,
            'err': '用户数据没有登录'
        }

        return next
    }
    
    this.session = this.session || {}
    this.session.user = user

    yield next
}