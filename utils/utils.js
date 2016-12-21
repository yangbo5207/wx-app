import Promise from 'promise'

function formatTime(date) {
    const now = new Date().getTime()
    const cur = new Date(date)
    const dis = (now - date) / 1000
    const year = cur.getFullYear()
    const month = fixZero(cur.getMonth() + 1)
    const day = fixZero(cur.getDate())

    const disHour = parseInt(dis / (60 * 60))

    if (disHour > 24) {
        return `${year}-${month}-${day}`
    }

    const disMinute = parseInt(dis / 60)

    if (disMinute > 60) {
        return `${disHour}小时前`
    }

    if (disMinute < 5) {
        return `刚刚`
    }

    return `${disMinute}分钟前`
}

function fixZero(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function wxPromise (cb) {
    return function (result = {}) {
        return new Promise ((resolve, reject) => {
            result.success = _res => {
                if(_res.statusCode) {
                    /(2|3)\d+/.test(_res.statusCode) ? resolve(_res.data) : reject(_res.data)
                } else {
                    resolve(_res)
                }
            }
            result.fail = (...args) => {
                reject(...args)
            }
            cb(result)
        })
    }
}

function type(elem) {
    if (elem == null) return elem + '';
    return toString.call(elem).replace(/[\[\]]/g, '').split(' ')[1].toLowerCase();
}

function wxPromiseAll (promises) {
    return Promise.all(promises)
}

module.exports = {
    formatTime: formatTime,
    promise: wxPromise,
    http: wxPromise,
    promiseAll: wxPromiseAll,
    type: type
}
