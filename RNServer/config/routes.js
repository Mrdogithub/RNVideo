'use strict'
var Router = require('koa-router')
var User = require('../app/controller/user.js')
var App = require('../app/controller/app.js')
var Creation = require('../app/controller/creation.js')
var Comment = require('../app/controller/comment.js')

module.exports = function() {
    var router = new Router({
        prefix:'/api'
    })

    // 当用户请求/api/1/u/signup，就会命中这条规则，会调用User.signup方法，并返回User.signup的返回值
    router.post('/u/signup',App.hasBody, User.signup)

    router.post('/u/verify', App.hasBody, User.verify)
    router.post('/u/update', App.hasBody, App.hasToken, User.update)
    router.post('/u/signature', App.hasBody, App.hasToken, App.signature)
    router.get('/creations', App.hasToken, Creation.find)
    router.post('/creations', App.hasBody, App.hasToken, Creation.save)
    router.post('/creations/video', App.hasBody, App.hasToken, Creation.video)
    router.post('/creations/audio', App.hasBody, App.hasToken, Creation.audio)

    // comments
    router.get('/comments', App.hasToken, Comment.find)
    router.post('/comments', App.hasBody, App.hasToken, Comment.save)


    // votes
    router.post('/up', App.hasBody, App.hasToken, Creation.up)
    return router
}