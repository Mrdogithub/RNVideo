'use strict'
var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
var db = 'mongodb://localhost/rn-app'

mongoose.Promise = require('bluebird')
mongoose.connect(db)
//mongoose.createConnection('localhost', 'test', 27017, {user: 'tester', pass: '123'});
//获取models 路径
var models_path = path.join(__dirname, '/app/models')

var walk = function(modelPath){
    fs.readdirSync(modelPath) // 读取 modelpath 下的所有文件
        .forEach(function(file){ // 对每个文件进行遍历
            var filePath = path.join(modelPath,'/' + file) // 获取当前文件路径
            var stat = fs.statSync(filePath) // 通过当前文件路径，获取文件状态
            if(stat.isFile()){
                if(/(.*)\.(js|coffee)/.test(file)){ // 如果是js文件，则加载
                    require(filePath)
                }
            } else if(stat.isDirectory()){
                walk(filePath)
            }
        })
}
walk(models_path)
var koa = require('koa')
var logger = require('koa-logger')
var router = require('./config/routes')()
var session = require('koa-session')
var bodyparser = require('koa-bodyparser')

// 生成服务器实例
var app = koa()

//会话中间件里面cookie 和session 加密的key
app.keys = ['rn']

//通过use 调用中间件

app.use(logger())
app.use(session(app))
app.use(bodyparser())

app
    .use(router.routes())
    .use(router.allowedMethods())
// app.use(function * (){
//     console.log(this.href)
//     console.log(this.method)
//     this.body = {
//         'success': true
//     }
// })
app.listen('1234')
console.log('123')