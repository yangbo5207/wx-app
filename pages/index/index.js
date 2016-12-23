import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'
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
            Object.assign(this, navigate)
        }).catch(() => {
            http(wx.showModal)({
                title: "提示",
                content: "好像出了点小问题，你可以尝试重新加载",
                confirmText: "重新加载"
            }).then(res => {
                if(res.confirm) {
                    this.onLoad()
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
    onPullDownRefresh () {
        this.getRecommendList(true)
    },
    getRecommendList (boolean) {
        const authorization = state.get('authorization')
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
                    'Authorization': authorization
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
                'Authorization': authorization
            }
        })
    },
    // 下拉加载更多
    upLoad () {
        this.data.enableUpLoadMore && this.getRecommendList()
    }
})
