'use strict'

var qiniu = require('qiniu')
var cloudinary = require('cloudinary')
var Promise = require('bluebird')
var sha1 = require('sha1')
var uuid = require('uuid')
var config = require('../../config/config')

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY = config.qiniu.SK

cloudinary.config(config.cloudinary)

exports.getQiniuToken = function(body) {
    var type = body.type
    var key = uuid.v4()
    var putPolicy
    var options = {
        persistentNotifyUrl: config.notify
    }

    if (type === 'avatar') {
        key += '.jpeg'
        putPolicy = new qiniu.rs.PutPolicy('gougouavatar:' + key)
    }

}

exports.uploadToCloudinary = function(url) {
    return new Promise(function(resolve, reject){
        cloudinary.uploader.upload(url, function(result){
            if (result && result.public_id) {
                resolve(result)
            } else {
                reject(result)
            }
        }, {
            resource_type: 'video',
            folder: 'video'
        })
    })
}