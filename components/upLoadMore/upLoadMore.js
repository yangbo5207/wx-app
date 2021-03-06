import { http, formatTime } from '../../utils/utils'
import state from '../../utils/state'
import { get } from '../../utils/http'

const app = getApp()

/**
 * 需要保存在当前页面对象data中的变量如下
 * dataList [] 列表的数据，该组件只负责将数据保存在data中，渲染样式需要在page中重新定义
 * isData 1|0 是否有数据
 * isBottomLoading 1|0 是否显示下拉刷新的loading提示
 * isBottomEnd 1|0 是否到底了
 * enableUpLoadMore 1|0 是否还能加载更多
 * pageCount {number} 表示第几页
 */

/**
 * @desc 请求列表数据，如果不是第一次请求，则为下拉刷新
 * @param {object} _this 页面对象
 * @param {object} options wx.request请求需要的参数对象,
 * @param {boolean} isFirst 是否是第一次请求数据
 * @return 返回promise对象
 */
function getData(_this, options, isFirst) {
    if (isFirst) {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })
        _this.setData({
            isBottomEnd: 0,
            // dataList: [],
            isData: 1,
            isBottomLoading: 0,
            enableUpLoadMore: 1,
            pageCount: 1
        })
    } else {
        if (!_this.data.enableUpLoadMore) { return }
        _this.setData({
            isBottomLoading: 1,
            pageCount: _this.data.pageCount + 1
        })
    }
    get(options.url, {
        data: options.data
    })
    .then( result => {
        console.log(result);
        if (result.data) {
            let list = result.data.map( item => {
                item.gmtCreate = formatTime(item.gmtCreate)
                return item
            })
            if (isFirst) {
                delayHideToast()
                _this.setData({
                    dataList: list
                })
            } else {
                _this.setData({
                    dataList: _this.data.dataList.concat(list),
                    isBottomLoading: 0
                })
            }
        }
        if (result.message) {
            delayHideToast()
            if (isFirst) {
                return _this.setData({
                    isData: 0
                })
            }
            _this.setData({
                isBottomLoading: 0,
                isBottomEnd: 1,
                enableUpLoadMore: 0
            })
        }
        return result
    })
    .catch (result => {
        delayHideToast()
        if (result.status) {
            if (result.status == 401) {
                app.reLogin().then(() => {
                    get(_this, options, isFirst)
                })
            }
            return result
        } else {
            wx.showModal({
                title: '提示',
                content: result.message
            })
        }
    })
}

const navigate = {
    navToPost (event) {
        const dataset = event.currentTarget.dataset
        wx.navigateTo({
            url: `../post/post?id=${dataset.objectid}&type=${dataset.type}`
        })
    },
    navToNews (event) {
        const dataset = event.currentTarget.dataset
        wx.navigateTo({
            url: `../hightlight/hightlight?id=${dataset.objectid}&type=${dataset.type}`
        })
    },
    navToPrediction (event) {
        const dataset = event.currentTarget.dataset
        wx.navigateTo({
            url: `../prediction/prediction?id=${dataset.objectid}&type=${dataset.type}`
        })
    },
    navToTopic (event) {
        const dataset = event.currentTarget.dataset
        wx.navigateTo({
            url: `../topic/topic?id=${dataset.objectid}&type=${dataset.type}`
        })
    }
}

function delayHideToast () {
    let timer = setTimeout ( () => {
        wx.hideToast()
        clearTimeout(timer)
    }, 500)
}

module.exports = {
    getData: getData,
    navigate: navigate
}
