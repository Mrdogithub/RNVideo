'use strict'
var mongoose = require('mongoose')
var Video = mongoose.model('Video')
var Audio = mongoose.model('Audio')
var Creation = mongoose.model('Creation')
var xss = require('xss')
var Promise = require('bluebird')
var config = require('../../config/config')
var robot = require('../service/robot')

var userFields = [
    'avatar',
    'nickname',
    'gender',
    'age',
    'breed'
]
exports.find = function *(next) {
    var page = parseInt(this.query.page, 10)
    var count = 5
    var offset = (page - 1) * count
    
    // 通过数组的形式包装多个异步操作，等所有异步操作都执行完毕之后，在继续下一步操作
    var queryArray = [
        Creation
            .find({finish: 70})
            .sort({'meta.createAt': -1})
            .skip(offset)
            .limit(count)
            .populate('author', userFields.join(' '))
            .exec(),
        Creation.count({finish: 70}).exec()
    ]

    var data = yield queryArray
    console.log('fetch data from service side')
    console.log(1 ,data)
    this.body = {
        success: true,
        data: data[0],
        total: data[1]
    }
}

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
        var audio_public_id = audio.public_id.replace(/\//g, ':')
        var videoName = video_public_id.replace(/\//g, '_') + '.mp4'
        // 通过在地址上拼接参数就可以动态合并音频和视屏的数据
        var videoURL = 'http://res.cloudinary.com/dsf3opwhl/video/upload/e_volume:-100/e_volume:400,l_video:' + audio_public_id + '/' + video_public_id + '.mp4'

        // 获取封面图
        var thumbName = video_public_id.replace(/\//g, '_') + '.jpg'
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
                        // 点击发布的时候，有可能在发布的这一刻，视屏并没有上传结束
                        // 1.发布视频的时候等待一下，等到qiniu的视屏同步结束再保存creation
                        // 2.作为后台的任务定期执行
                        // 3.上传完视屏以后调用asynicmedia的时候，通过creation查找 video
                        Creation.findOne({
                            video: video._id,
                            audio: audio._id
                        }).exec()
                        .then(function(_creation) {
                            if (_creation) {
                                if (!creation.qiniu_video) {
                                    _creation.qiniu_video = _audio.qiniu_video
                                    _creation.save()
                                }
                            }
                        })
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
                        Creation.findOne({
                            video: video._id,
                            audio: audio._id
                        }).exec()
                        .then(function(_creation) {
                            if (_creation) {
                                if (!creation.qiniu_video) {
                                    _creation.qiniu_thumb = _audio.qiniu_thumb
                                    _creation.save()
                                }
                            }
                        })
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
    var user = this.session.user
    var video = yield Video.findOne({
        _id: videoId
    }).exec()

    var audio = yield Audio.findOne({
        _id: audioId
    }).exec()

    if (!video || !audio) {
        this.body = {
            success: false,
            err: '音频或者视频素材不能为空'
        }

        return next
    }

    // 数据去重机制，避免重复创建
    var creation = yield Creation.findOne({
        audio: audioId,
        video: videoId
    }).exec()

    // 如果creation 数据不存在，创建一条新数据
    if (!creation) {
        var creationData = {
            author: user._id,
            title: xss(title),
            audio: audioId,
            video: videoId,
            finish: 20
        }

        // 通过获取public_id 进一步确定音频和视屏已经准备充分
        var video_public_id = video.public_id
        var audio_public_id = audio.public_id

        if (video_public_id && audio_public_id) {
            creationData.cloudinary_video = 'http://res.cloudinary.com/dsf3opwhl/video/upload/e_volume:-100/e_volume:400,l_video:' + audio.public_id.replace(/\//g, ':') + '/' + video_public_id + '.mp4'
            creationData.cloudinary_thumb = 'http://res.cloudinary.com/dsf3opwhl/video/upload/' + video_public_id + '.jpg'
            creationData.finish += 20
        }


        // 封面图和视屏已经同步结束之后，需要对creationData 进行赋值操作
        if (audio.qiniu_thumb) {
            creationData.qiniu_thumb = audio.qiniu_thumb
            creationData.finish += 60
        }

        if (audio.qiniu_video) {
            creationData.qiniu_video = audio.qiniu_video
            creationData.finish += 60
        }
        // 通过new的方式新建一个数据的实例
        creation = new Creation(creationData)
    }

    creation = yield creation.save()
    console.log('creation:' + creation)

    this.body = {
        success: true,
        data: {
            _id: creation._id,
            finish: creation.finish,
            title: creation.title,
            qiniu_thumb: creation.qiniu_thumb,
            qiniu_video: creation.qiniu_video,
            author: {
                avatar: user.avatar,
                nickname: user.nickname,
                gender: user.gender,
                breed: user.breed,
                _id: user._id   
            }
        }
    }
}