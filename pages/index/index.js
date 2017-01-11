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
    onLoad () {
        app.login().then(result => {
            this.getRecommendList(true)
            .then(() => {
                wx.stopPullDownRefresh()
            })
            assign(this, navigate)
        }).catch(() => {
            http(wx.showModal)({
                title: "提示",
                content: "好像出了点小问题，你可以尝试重新加载",
                confirmText: "重新加载"
            }).then(res => {
                if(res.confirm) {
                    app.reLogin()
                }
            })
        })

        http(wx.getSystemInfo)()
        .then( res => {
            this.setData({
                windowWidth: res.windowWidth,
                windowHeight: res.windowHeight
            })
        })
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
                },
                header: {
                    'Authorization': state.get('authorization')
                }
            }, true)
        }
        return getData (this, {
            url: _streamings,
            data: {
                pageCount: this.data.pageCount + 1,
                pageSize: pageSize
            },
            header: {
                'Authorization': state.get('authorization')
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
