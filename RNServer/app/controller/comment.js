'use strict'
var mongoose = require('mongoose')
var Comment = mongoose.model('Comment')
var Creation = mongoose.model('Creation')

var userFields = [
    'avatar',
    'nickname',
    'gender',
    'age',
    'breed'
]

// 查找comments
exports.find = function *(next) {
    // 通过id获取comments
    
    var id = this.query.creation

    if (!id) {
        this.body = {
            success: false,
            err: 'id 不能为空'
        }

        return next
    }

    var queryArray = [
        Comment.find({
            creation: id
        })
        .populate('replyBy', userFields.join(' '))
        .sort({'meta.createAt': -1})
        .exec(),
        Comment.count({creation: id}).exec()
    ]

    var data = yield queryArray
    this.body = {
        success: true,
        data: data[0],
        total: data[1]
    }
}

// 存储 comments

exports.save = function *(next) {
    // 获取要存储的数据
    var commentData = this.request.body.comment
    var user = this.session.user

    // 查找要评论的creation，如果不存在，无法保存评论
    var creation = yield Creation.findOne({
        _id: commentData.creation
    })

    if (!creation){
        this.body = {
            success: false,
            err: '视屏不见了'
        }

        return next
    }

    var comment
    // commentData.cid 要保存的comment的id
    if (commentData.cid) { // 针对某条评论进行回复
        comment = yield Comment.findOne({
            _id: commentData.cid
        })
        .exec()

        var reply = {
            from: commentData.from,
            to: commentData.tid,
            content: commentData.content
        }

        // 保存回复数据
        comment.reply.push(reply)
        comment = yield comment.save()

        this.body = {
            success: true
        }
    }
    else { // 只针对creation 进行评论
        comment = new Comment({
            creation: creation._id,
            replyBy: user._id,
            replyTo: creation.author,
            content: commentData.content
        })

        comment = yield comment.save()
        this.body = {
            success: true,
            data: [comment] // 对creation 进行评论之后，返回所有评论列表
        }
    }

}