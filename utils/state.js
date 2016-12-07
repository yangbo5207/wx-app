let events = [], // 存储事件
    states = {}, // 存储变量

    // 获取states中name的值
    get = function (name) {
        if (states[name]) {
            return states[name]
        }
        return '';
    },

    set = function (name, value) {
        if (!states[name]) {
            states[name] = value
            events[name] = []
        } else {
            states[name] = value
        }
    },

    // notification : 对应的通知方法，接收到通知之后会执行的动作
    bind = function (name, notification, targetPage) {
        if (name && notification) {
            if (!targetPage) {
                console.log('bind error: 没有绑定页面对象')
                return false
            }
            events.push({
                name: name,
                handler: notification,
                page: targetPage
            })
        } else {
            console.log('bind error: no name or handler')
        }
    },

    // 如果为一个参数，则移除所有的方法，如果2个参数，只移除对应的notification方法
    remove = function (name, targetPage) {
        events.forEach( function (value, i) {
            if (value.name === name && value.page === targetPage) {
                events.splice(i, 1)
                return true
            }
        })
        return ''
    },

    dispatch = function (name, value) {
        if (!value) {
            value = get(name)
        } else {
            set(name, value)
        }
        if (!events.length) {
            return false
        }

        events.forEach( function (item, i) {
            if (item.name == name) {
                item.handler(value)
            }
        })
    }

    module.exports = {
        get: get,
        set: set,
        bind: bind,
        remove: remove,
        dispatch: dispatch
    }
