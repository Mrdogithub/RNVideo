'use strict'

module.exports = {
    header: {
        method: 'POST',
        headers: {
            'Accept': 'appliction/json',
            'Content-Type': 'application/json'
        }
    },
    qiniu: {
        upload: 'http://upload.qiniu.com',
        thumb: 'http://pcvdaisr8.bkt.clouddn.com/',
        video: 'http://pcvdaisr8.bkt.clouddn.com/',
        avatar: 'http://pcvdaisr8.bkt.clouddn.com/'
    },
    backup:{
        avatar: 'http://res.cloudinary.com/dsf3opwhl/video/upload/tqi73d6gtlbyhgaepv5i.jpg'
    },
    cloudinary: {
        'base': 'https://res.cloudinary.com/dsf3opwhl',
        'image': 'https://api.cloudinary.com/v1_1/dsf3opwhl/image/upload',
        'video': 'https://api.cloudinary.com/v1_1/dsf3opwhl/video/upload',
        'audio': 'https://api.cloudinary.com/v1_1/dsf3opwhl/raw/upload',
        'cloud_name': 'dsf3opwhl',
        'api_key': '742529175474162'
    },
    api: {
        // base: 'https://rapapi.org/mockjs/32229',
        base: 'http://localhost:1234',
        creations: '/api/creations',
        up: '/api/up',
        comment: '/api/comments',
        signup: '/api/u/signup',
        verify: '/api/u/verify',
        update: '/api/u/update',
        signature: '/api/u/signature',
        video: '/api/creations/video',
        audio: '/api/creations/audio'
    }
}


