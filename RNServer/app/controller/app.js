'use strict'
var mongoose = require('mongoose')
var User = mongoose.model('User')
exports.signature = function *(next) {
    this.body = {
        'success': true
    }
}

exports.hasBody = function *(next) { // 创建中间件
    var body = this.request.body || {}

    if(Object.keys(body.length === 0)) {
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