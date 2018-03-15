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
        base: 'http://rapapi.org/mockjs/32229',
        creations: '/api/creations',
        up: '/aip/up',
        comment: '/api/comments'
    }
}


