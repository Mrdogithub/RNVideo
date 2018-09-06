'use strict'
var mongoose = require('mongoose')
var Video = mongoose.model('Video')
var Audio = mongoose.model('Audio')
var Promise = require('bluebird')
var config = require('../../config/config')
var robot = require('../service/robot')

function AsyncMedia(videoId, audioId) {

    if (!videoId) return
    console.log('video id:' + videoId)
    console.log('audio id:' + audioId)
    var query = {
        _id: audioId
    }

    if (!audioId) {
        query = {
            video: videoId
        }
    }

    // 因为有多个异步操作，为了保证每次进入AsyncMedia 都能拿到最新的video和audio 需要从新查找
    Promise.all([
        Video.findOne({_id: videoId}).exec(),
        Audio.findOne(query).exec()
    ])
    .then(function(data){
        console.log(data)
        var video = data[0]
        var audio = data[1]
        console.log('check data')
        // 判断数据是否已经从七牛传到了cloundnary上，如果video.publick_id 或者 audio.public_id
        // 不存在，说明视屏 或者音频的数据还没有同步到cloundary上面。
        if (!video || !video.public_id || !audio || !audio.public_id) {
            return
        }

        console.log('begin transfer')
        var video_public_id = video.public_id
        var audio_public_id = audio.public_id.replace('/', ':')
        var videoName = video_public_id.replace('/', '_') + '.mp4'
        // 通过在地址上拼接参数就可以动态合并音频和视屏的数据
        var videoURL = 'http://res.cloudinary.com/dsf3opwhl/video/upload/e_volume:-100/e_volume:400,l_video:' + audio_public_id + '/' + video_public_id + '.mp4'

        // 获取封面图
        var thumbName = video_public_id.replace('/', '_') + '.jpg'
        var thumbURL = 'http://res.cloudinary.com/dsf3opwhl/video/upload/' + video_public_id + '.jpg'

        console.log('data transfer to qiniu')

        robot
            .saveToQiniu(videoURL, videoName)
            .catch(function(error){
                console.log(error)
            })
            .then(function(response){
                if (response && response.key) {
                    audio.qiniu_video = response.key
                    audio.save().then(function(_video){
                        console.log(_video)
                        console.log('video transfer success')
                    })
                }
            })
        robot
            .saveToQiniu(thumbName, thumbURL)
            .catch(function(error){
                console.log(error)
            })
            .then(function(response){
                if (response && response.key) {
                    audio.qiniu_thumb = response.key
                    audio.save().then(function(_audio){
                        console.log(_audio)
                        console.log('audio transfer success')
                    })
                }
            })
    })
    
}
exports.audio = function *(next) {
    var body = this.request.body
    var audioData = body.audio
    var videoId = body.videoId
    var user = this.session.user

    if (!audioData || !audioData.public_id) {
        this.body = {
            success: false,
            err: '音频没有上传成功!'
        }

        return next
    }

    // 查看数据库中是否有audio
    // 不加 yield 的话，就是一个promise请求
    var audio = yield Audio.findOne({
        public_id: audioData.public_id
    })
    .exec()

    var video = yield Video.findOne({
        _id: videoId
    })

    if (!audio) {
        var _audio = {
            author: user._id,
            public_id: audioData.public_id,
            detail: audioData
        }

        if (video) {
            _audio.video = video._id
        }

        // 生成一条音频数据
        audio = new Audio(_audio)
        audio = yield audio.save()
    }
    // 异步操作
    AsyncMedia(video._id, audio._id)

    this.body = {
        success: true,
        data: audio._id
    }
}

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

                video.save().then(function(_video){
                    AsyncMedia(_video._id)
                })
            }
        })

    this.body = {// 异步保存不会影响body的返回
        success: true,
        data: video._id
    }
}

exports.save = function *(next){
    var body = this.request.body
    var videoId = body.videoId
    var audioId = body.audioId
    var title = body.title

    console.log(videoId)
    console.log(audioId)
    console.log(title)
    this.body = {
        success: true
    }
}