'use strict'
var mongoose = require('mongoose')
var User = mongoose.model('User')
var config = require('../../config/config.js')
var sha1 = require('sha1')
exports.signature = function *(next) {

	var body = this.request.body
	var type = body.type
	var timestamp = body.timestamp
	var folder
	var tags

	if (type === 'avatar') {
		folder = 'avatar'
		tags = 'app,avatar'
	}

	if (type === 'video') {
		folder = 'video'
		tags = 'app,video'
	}

	if (type === 'audio') {
		folder = 'audio'
		tags = 'app,audio'
	}

	var signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + config.CLOUDINARY.api_secret
    signature = sha1(signature)

    // 将加密后的签名值返回给客户端，客户端利用服务器端返回的签名值来上传图片
    this.body = {
        'success': true,
        'data': signature
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