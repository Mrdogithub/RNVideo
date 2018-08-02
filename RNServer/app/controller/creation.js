'use strict'
var mongoose = require('mongoose')
var User = mongoose.model('Video')
var config = require('../../config/config.js')
var robot = require('../service/robot')

exports.vido = function *(next) {
    var body = this.request.body
    var videoData = body.video
    var user = this.session.user

    if (!videoData || !videoData.key) {
        this.body = {
            success: false,
            err: '视屏没有上传成功!'
        }

        return next
    }

    var video = yield Video.findOne({
        qiniu_key: videoData.key    
    })
    .exec()

    if (!video) {// 如果数据库中没有存过qiniu_key,需要创建一个video
        video = new Video({
            author: user._id,
            qinniu_key: videoData.key,
            persistentId: videoData.persistentId
        })

        video = yield video.save()
    }
    var url = config.qiniu.video + video.qiniu_key

    robot
        .uploadToCloundinary(url)
        .then(function(data){
            if (data && data.public_id) { //异步将video保存到cloudinary
                video.public_id = data.public_id
                video.detail = data

                video.save()
            }
        })

    this.body = {// 异步保存不会影响body的返回
        success: true,
        data: video._id
    }
}
