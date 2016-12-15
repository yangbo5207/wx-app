import utils from './utils'

let events = [] // 存储事件
let states = {} // 存储变量

/*
 * @param name 属性名
 * @desc 通过属性名获取保存在state中的值 
 */
function get (name) {
    if(states[name]) { return states[name] }
    return ''
}

function getStates () {
    return states
}

/*
 * @param options {object} 键值对
 * @param target {object} 属性值为对象的属性，只在函数实现时递归中传入
 * @desc 通过传入键值对的方式修改state树，方式与小程序的data或者react中的setStates类似
 */
function set (options, target) {
    let keys = Object.keys(options)
    let o = target ? target : states
    keys.map( item => {
        if(typeof o[item] == 'undefined') {
            o[item] = options[item]
        } 
        else {
            if(utils.type(o[item]) == 'object') {
                set(options[item], o[item])
            } else {
                o[item] = options[item]
            }
        }
        return item
    })
}

/*
 * @param name {string} 绑定通知的名称
 * @param nocification {function} 绑定通知的具体执行内容
 * @param targetPage {object} 页面对象
 * @desc 绑定事件
 */
function bind (name, notification, targetPage) {
    if (name && notification) {
        if (!targetPage) {
            console.error('bind error: 没有绑定页面对象')
            return;
        } 
        events.push({
            name: name,
            handler: notification,
            page: targetPage
        })
    } else {
        console.error('bind error: no name or handler')
    }
}

/*
 * @desc 移除绑定
 */
function remove (name, targetPage) {
    events.map( (item, i) => {
        if (item.name === name && item.page === targetPage) {
            events.splice(i, 1)
        }
    })
    return ''
}

/*
 * @param name {string} 名称，states与events中的name保持一致，states[name] 将会是events[i].handler的参数
 * @param value 状态值 该值与name组成键值对保存在states中，并作为参数传递给handler 
 * @desc 执行绑定的方法
 */
function dispatch (name, value) {
    if(!value) {
        value = get(name)
    }
    else {
        set({
            [name]: value
        })
    }
    if(!events.length) { return }

    events.map( (item, i) => {
        if(item.name == name) {
            item.handler(value)
        }
    })
}

module.exports = {
    get: get,
    getStates: getStates,
    set: set,
    bind: bind,
    remove: remove,
    dispatch: dispatch
}
