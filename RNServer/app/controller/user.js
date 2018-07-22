'use strict'
var mongoose = require('mongoose')
var uuid = require('uuid')
var sms = require('../service/sms')
console.log(1,mongoose)
var User = mongoose.model('User')
var xss = require('xss')
exports.signup = function *(next) {
    var phoneNumber = xss(this.request.body.phoneNumber.trim())
    var user = yield User.findOne({
        phoneNumber: phoneNumber
    }).exec()
    //无论用户是否注册成功，都需要更新用户验证码
    var verifyCode = sms.getCode()
    if(!user){
        var accessToken = uuid.v4()// 生成一个4段的token值

        user = new User({
            phoneNumber : xss(phoneNumber),
            avatar: 'https://image.baidu.com/search/detail?ct=503316480&z=&tn=baiduimagedetail&ipn=d&word=react&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=-1&cs=3225331961,371907858&os=3020104978,2585156032&simid=0,0&pn=25&rn=1&di=77543574570&ln=1911&fr=&fmq=1531077131264_R&ic=0&s=undefined&se=&sme=&tab=0&width=&height=&face=undefined&is=0,0&istype=2&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&objurl=http%3A%2F%2Fwww.xz7.com%2Fup%2F2017-9%2F2017927103353.png&rpstart=0&rpnum=0&adpicid=0',
            verifyCode : verifyCode, // 新增用户需提供verifyCode
            accessToken: accessToken,
            nickname: 'RN'
        })
    } else{
        user.verifyCode = verifyCode
    }
     console.log(1, user)
    //用户数据保存
    try {
        user = yield user.save()
    } catch(e) {
        this.body = {
            success: false
        }
        return next
    }

    //用户数据创建完成之后，开始发送验证码
    var msg = '您的注册验证码是：'+user.verifyCode

    //包一层try catch ，避免发生错误导致程序挂起
    // try{
    //     sms.sent(user.phoneNumber, msg)
    // }catch(e){
    //     console.log(e)
    //     this.body = {
    //         'success': false,
    //         'err':'短信发送异常'
    //     }
    //     return next
    // }
    this.body = {
        'success': true
    }
}

exports.verify = function *(next) {
    var verifyCode = this.request.body.verifyCode
    var phoneNumber = this.request.body.phoneNumber

    if(!verifyCode || !phoneNumber){
        this.body = {
            'success': false,
            'err': '验证未通过'
        }
        return next //项目后期如果变复杂，可会会加入一些中间件处理返回数据的封装
    }

    // 如果存在 verifyCode 和 phoneNumber,则与数据库中的数据进行比对
    var user = yield User.findOne({
        'phoneNumber': phoneNumber,
        'verifyCode': verifyCode
    }).exec()

    if(user){
        user.verifyCode = true
        user = yield user.save()
        this.body = {
            success: true,
            data: {
                nickname: user.nickname,
                accessToken: user.accessToken,
                avatar: user.avatar,
                _id: user._id
            }
        }
    } else{
        this.body = {
            'success': false,
            'err': '验证未通过'
        }
    }

}

exports.update = function *(next) {
    var body = this.request.body
    var user =this.session.user
    // 通过App.hasBody 的中间件已经完成查询的任务，不需要在重新获取
    //var accessToken = body.accessToken
    // var user  = yield User.findOne({
    //     'accessToken': accessToken
    // }).exec()

    // if(!user){
    //     this.body = {
    //         'success': false,
    //         'err': '用户丢失'
    //     }

    //     return next 
    // }

    var updateFileds = 'avatar,gender,age,nickname,breed'.split(',')

    updateFileds.forEach(function(fild){
        if(body[fild]){
            user[fild] = xss(body[fild].trim())
        }
    })

    user = yield user.save()
    this.body = {
        success: true,
        data: {
            nickname: user.nickname,
            accessToken: user.accessToken,
            avatar: user.avatar,
            gender: user.gender,
            age: user.age,
            breed: user.breed,
            _id: user._id
        }
    }
}