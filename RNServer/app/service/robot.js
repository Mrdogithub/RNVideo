'use strict'

var qiniu = require('qiniu')
var cloudinary = require('cloudinary')
var Promise = require('bluebird')
var sha1 = require('sha1')
var uuid = require('uuid')
var config = require('../../config/config')

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY = config.qiniu.SK

cloudinary.config(config.CLOUDINARY)
var bucket = 'myproudct'
function upToken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy({scope: bucket + ':' + key})
    var mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY , qiniu.conf.SECRET_KEY);
    return putPolicy.uploadToken(mac)
}

exports.uploadToCloudinary = function(url) {
    return new Promise(function(resolve,reject) {
        cloudinary.uploader.upload(url, function(result){
            console.log('result ---- robot')
            console.log(1, result)
            console.log('----ok')
            if (result && result.public_id) {
                resolve(result)
            }
            else {
                reject(result)
            }
        }, {
            resource_type: 'video'
        })
    })  
}
exports.getQiniuToken = function(body) { // 获取qiniu 签名
    var mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY , qiniu.conf.SECRET_KEY);
    var type = body.type
    var key = uuid.v4()
    var putPolicy
    var options = {
        persistentNotifyUrl: config.notify //进行转码操作的url
    }
    var options = {
        persistentNotifyUrl: config.notify
    }

    if (type === 'avatar') {
        key += '.jpeg'
        putPolicy = new qiniu.rs.PutPolicy({scope: bucket + ':' + key})
    }
    else if (type === 'video') {
        key += '.mp4'
        options.scope = 'myproudct:' + key
        options.persistentOps = 'avthumb/mp4/an/1'
        putPolicy = new qiniu.rs.PutPolicy(options)
    }
    else if (type === 'audio') {

    }
    var token =  putPolicy.uploadToken(mac)

    return {
        key: key,
        token: token
    }
}

exports.getCloundinaryToken = function(body) { // 获取cloundinary 签名
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
}

