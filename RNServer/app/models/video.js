'use strict'
// 1. 引入建模工具
var mongoose =  require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId;
// 2.定义字段约定
var videoschema = new Schema({
    author: { // 关联表
        type: ObjectId,
        ref: 'User'
    },
    qinniu_key: String,
    persistentId: String,
    qiniu_final_key: String,
    qiniu_detail: String,

    public_id: String,
    detail: String,
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
videoschema.pre('save', function(next){
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
module.exports = mongoose.model('Video', videoschema)