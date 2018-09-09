 'use strict'
// 1. 引入建模工具
var mongoose =  require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed
// 2.定义字段约定
var CreationSchema = new Schema({
    author: { // 关联表
        type: ObjectId,
        ref: 'User'
    },

    // 视屏创意需要同时使用音频文件和视屏文件
    // 所以需要同时引入两个表的数据
    video: { // 关联表
        type: ObjectId,
        ref: 'Video'
    },
    audio: { // 关联表
        type: ObjectId,
        ref: 'Audio'
    },

    // 存储在qiniu上的缩略图 和视屏
    qiniu_thumb: String,
    qiniu_video: String,
    
    // 缩略图 和视屏在上传到qiniu之前是存储在cloundnary上面，所以可以添加一下字段对缩略图和视屏做个备份
    cloudinary_thumb: String,
    cloudinary_video: String,

    // 标识当前视屏被加工进度
    finish: {
        type: Number,
        default: 0
    },

    // 存储点赞的每个用户id
    votes: [String],

    // 点赞的次数
    up: {
        type: Number,
        default: 0
    },


    qiniu_detail: Mixed,

    public_id: String, // cloudnary 资源文件名
    detail: Mixed,
    meta: {
        createAt:{
            type: Date,
            default: Date.now()
        },
        updateAt:{
            type: Date,
            default: Date.now()
        }
    }
})
// 3.前置处理
// save 之前对schema 进行前置处理
CreationSchema.pre('save', function(next){
    if(!this.isNew){
        this.meta.updateAt = Date.now()
    } else {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    next()
})
 // 4.建模
// 第一个参数是数据控用户表的表名，第二个参数是创建用户的字段约定

// 5.导出
module.exports = mongoose.model('Creation', CreationSchema)