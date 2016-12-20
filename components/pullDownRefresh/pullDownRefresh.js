import { http } from '../../utils/utils'
import state from '../../utils/state'

/**
 * 需要保存在当前页面对象data中的变量如下
 * dataList [] 列表的数据，该组件只负责将数据保存在data中，渲染样式需要在page中重新定义
 * isData 1|0 是否有数据  
 * isBottomLoading 1|0 是否显示下拉刷新的loading提示
 * isBottomEnd 1|0 是否到底了
 * enablePullDownRefresh 1|0 是否还能下拉刷新
 * pageCount {number} 表示第几页
 */

/**
 * @desc 请求列表数据，如果不是第一次请求，则为下拉刷新
 * @param {object} _this 页面对象
 * @param {object} options wx.request请求需要的参数对象,
 * @param {boolean} isFirst 是否是第一次请求数据
 * @return 返回promise对象
 */
function get (_this, options, isFirst) {
    const authorization = state.get('authorization')

    if (isFirst) {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })
        _this.setData({
            dataList: [],
            isData: 1,
            isBottomLoading: 0,
            isBottomEnd: 0,
            enablePullDownRefresh: 1,
            pageCount: 1
        })
    } else {
        if (!_this.data.enablePullDownRefresh) { return }
        _this.setData({
            isBottomLoading: 1,
            pageCount: _this.data.pageCount + 1
        })
    }

    return http(wx.request)(options)
    .then( result => {
        if (result.data) {
            if (isFirst) {
                delayHideToast()
                _this.setData({
                    dataList: result.data
                })
            } else {
                _this.setData({
                    dataList: _this.data.dataList.concat(result.data),
                    isBottomLoading: 0
                })
            }
        } 
        if (result.message) {
            _this.setData({
                isBottomLoading: 0,
                isBottomEnd: 1,
                enablePullDownRefresh: 0
            })
        }
        return result
    })
    .catch (result => {
        delayHideToast()
        if (result.status) {
            http(wx.showModal)({
                title: '提示',
                content: `错误码：${result.status}`,
                confirmText: '重新加载'
            })
            .then(result => {
                if (result.confirm) {
                    get (_this, options, isFirst)
                }
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '网络好像出了点问题'
            })
        }
    })
}

function delayHideToast () {
    let timer = setTimeout ( () => {
        wx.hideToast()
        clearTimeout(timer)
    }, 500)
}

module.exports = {
    getData: get
}