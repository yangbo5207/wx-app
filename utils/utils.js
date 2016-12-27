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
let cache = {}
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

function getParam (curURL, key) {
	var a = curURL.slice(curURL.indexOf('?') + 1).split('&');
	if(!curURL) { return '' }
	if(curURL.indexOf(key) == -1) { return '' }

	return function () {
		for(var i in a) {
			var _a = a[i].split('=');
			if (_a[0] == key) {
				return _a[1]
			}
		}
		return ''
	}()
}

/**
 * @param num {number} 将要被处理的数
 * @param count  {number} 省略到小数后第number-1位，根据number位进行四舍五入处理
 * @return {string}
 */
function decimal (num, count) {
    var floatNum = parseFloat(num);
	if (isNaN(floatNum)) {
		return;
	}

    if (count == 0) {
        return Math.round(floatNum)
    }

    var re = Math.round(floatNum * Math.pow(10, count))
    var rs = re.toString().split('')
    if (re == 0) {
        for(let i = 0; i < count - 1; i++) {
            rs.push('0')
        }
    }
    rs.splice(rs.length - count, 0, '.')
    if (num < 1) {
        rs.unshift('0')
    }
    return rs.join('')
}

function symbolType(symbol) {
    if (/^[013]\d{5}$/.test(symbol)) {
        return 'SZ'
    }
    if (/(^[56]\d{5}$|\.SH$)/.test(symbol)) {
        return 'SH'
    }
    if (/(HSI|HSCEI|HSCCI)/.test(symbol)) {
        return 'HK'
    }
    if (/^\d{5}$/.test(symbol)) {
        return 'HK'
    }
    if (/^[.A-Za-z]+$/.test(symbol)) {
        return 'US'
    }
}

module.exports = {
    formatTime: formatTime,
    http: wxPromise,
    promiseAll: wxPromiseAll,
    type: type,
    getParam: getParam,
    decimal: decimal
}
