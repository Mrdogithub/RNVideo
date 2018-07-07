'use strict'
// 1. 引入建模工具
var mongoose =  require('mongoose')

// 2.定义字段约定
var userschema = new mongoose.Schema({
    phoneNumber:{
        unique: true,
        type: String
    },
    areaCode: String,
    verifyCode: String,
    accessToken: String,
    nickName: String,
    gender: String,
    breed: String,
    age: String,
    avatar: String,
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
userschema.pre('save', function(next){
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
module.exports = mongoose.model('User', userschema)