'use strict'

module.exports = {
    header: {
        method: 'POST',
        headers: {
            'Accept': 'appliction/json',
            'Content-Type': 'application/json'
        }
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
        video: '/api/creations/video'
    }
}


