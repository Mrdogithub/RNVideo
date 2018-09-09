'use strict'
// 1. 引入建模工具
var mongoose =  require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed
// 2.定义字段约定
var CommentSchema = new Schema({
    // 每一个评论都会对应一个creation
    creation:{
        type: ObjectId,
        ref: 'Creation'
    },
    // 评论内容
    content: String,

    // 评论人
    replyBy: { // 关联表
        type: ObjectId,
        ref: 'User'
    },

    //被评论人
    replyTo: {
        type: ObjectId,
        ref: 'User'
    },

    // 多次评论内容
    reply: [
        {
            from: {
                type: ObjectId,
                ref: 'User'
            },
            to: {
                type: ObjectId,
                ref: 'User'
            },
            content: String
        }
    ],
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
CommentSchema.pre('save', function(next){
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
module.exports = mongoose.model('Comment', CommentSchema)