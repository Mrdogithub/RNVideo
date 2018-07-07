'use strict'
var Router = require('koa-router')
var User = require('../app/controller/user.js')
var App = require('../app/controller/app.js')
module.exports = function() {
    var router = new Router({
        prefix:'/api/1'
    })

    // 当用户请求/api/1/u/signup，就会命中这条规则，会调用User.signup方法，并返回User.signup的返回值
    router.get('/u/signup', User.signup)

    router.post('/u/verify', User.verify)
    router.post('/u/update', User.update)
    router.post('/u/signature', App.signature)

    return router
}