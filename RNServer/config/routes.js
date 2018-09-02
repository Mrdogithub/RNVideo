'use strict'
var Router = require('koa-router')
var User = require('../app/controller/user.js')
var App = require('../app/controller/app.js')
var Creation = require('../app/controller/creation.js')
module.exports = function() {
    var router = new Router({
        prefix:'/api'
    })

    // 当用户请求/api/1/u/signup，就会命中这条规则，会调用User.signup方法，并返回User.signup的返回值
    router.post('/u/signup',App.hasBody, User.signup)

    router.post('/u/verify', App.hasBody, User.verify)
    router.post('/u/update', App.hasBody, App.hasToken, User.update)
    router.post('/u/signature', App.hasBody, App.hasToken, App.signature)
    router.post('/creations/video', App.hasBody, App.hasToken, Creation.video)
    router.post('/creations/audio', App.hasBody, App.hasToken, Creation.audio)
    return router
}