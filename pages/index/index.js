import regeneratorRuntime from '../../libs/regenerator-runtime'; // support use async/await
import config from '../../utils/config'
import state from '../../utils/state'
import { http, assign } from '../../utils/utils'
import { getData, navigate } from '../../components/upLoadMore/upLoadMore'

const app = getApp()

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0
    },
    async onLoad () {
        try {
            await app.login()
            const res = this.getRecommendList(true);
            wx.stopPullDownRefresh()
            assign(this, navigate);

            const info = wx.getSystemInfoSync;
            this.setData({
                windowWidth: info.windowWidth,
                windowHeight: info.windowHeight
            })
        } catch(err) {
            wx.showModal({
                title: 'Error Message',
                content: err.message,
                confirmText: 'reload',
                success: () => this.onLoad()
            })
        }
    },
    getRecommendList (boolean) {
        const _streamings = `${config.community}/v5/streamings`
        const pageSize = 10
        if (boolean) {
            return getData(this, {
                url: _streamings,
                data: {
                    pageCount: 1,
                    pageSize: pageSize
                }
            }, true)
        }
        return getData (this, {
            url: _streamings,
            data: {
                pageCount: this.data.pageCount + 1,
                pageSize: pageSize
            }
        })
    },

    onPullDownRefresh () {
        this.onLoad()
    },
    
    // 加载更多
    onReachBottom () {
        this.data.enableUpLoadMore && this.getRecommendList()
    },
    onShareAppMessage (option) {
        const postTitle = '今日看点'
        const path = this.__route__

        return {
            title: postTitle,
            path: path
        }
    }
})
