'use strict'
var mongoose = require('mongoose')
var Video = mongoose.model('Video')
var config = require('../../config/config')
var robot = require('../service/robot')

exports.video = function *(next) {
    var body = this.request.body
    var videoData = body.video
    var user = this.session.user
    console.log('videoData:')
    console.log(1, videoData)
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
        console.log('user ----')
        console.log(1, user)
        video = new Video({
            author: user._id,
            qiniu_key: videoData.key,
            persistentId: videoData.persistentId // 任务id
        })

        video = yield video.save()
    }
    var url = config.qiniu.video + '/' +video.qiniu_key
    console.log('url:----')
    console.log(url)
    robot
        .uploadToCloudinary(url)
        .then(function(data){ // 视屏上传到cloudnary 之后返回的视屏信息
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
