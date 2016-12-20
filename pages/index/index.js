import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'
import { getData } from '../../components/pullDownRefresh/pullDownRefresh'

const app = getApp()

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0,
    },
    onLoad () {
        const authorization = state.get('authorization')
        if(authorization) {
            this.getRecommendList(true);
        } else {
            app.login()
            .then(() => {
                this.getRecommendList(true);
            })
        }
        promise(wx.getSystemInfo)()
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
    navToPost (event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: event.currentTarget.dataset.type
        })
        wx.navigateTo({
            url: '../post/post'
        })
    },
    navToNews (event) {
        const dataset = event.currentTarget.dataset
        state.set({
            postid: dataset.objectid,
            type: dataset.type
        })
        wx.navigateTo({
            url: '../hightlight/hightlight'
        })
    },
    navToPrediction (event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: event.currentTarget.dataset.type
        })
        wx.navigateTo({
            url: '../prediction/prediction'
        })
    },
    navToTopic (event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: event.currentTarget.dataset.type
        })
        wx.navigateTo({
            url: '../topic/topic'
        })
    },
    getRecommendList (boolean) {
        const authorization = state.get('authorization')
        const _streamings = `${config.communityDomainDev}/v5/streamings`
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
        this.data.enablePullDownRefresh && this.getRecommendList()
    }
})
