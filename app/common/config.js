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
        base: 'https://rapapi.org/mockjs/32229',
        creations: '/api/creations',
        up: '/aip/up',
        comment: '/api/comments',
        signup: '/api/user/signup',
        verify: '/api/user/verify'
    }
}


