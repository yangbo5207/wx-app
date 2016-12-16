import Promise from 'promise'

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function wxPromise (cb) {
    return function (result = {}) {
        return new Promise ((resolve, reject) => {
            result.success = _res => {
                if(_res.statusCode) {
                    _res.statusCode == 200 ? resolve(_res) : reject(_res)
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
    promiseAll: wxPromiseAll,
    type: type
}