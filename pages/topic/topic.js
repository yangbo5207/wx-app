import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'
import { getData } from '../../components/upLoadMore/upLoadMore'

const app = getApp()

Page({
    data: {
        topicInfo: {},
        windowWidth: 0,
        windowHeight: 0
    },
    onLoad (option) {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })
        const authorization = state.get('authorization')
        // const postid = option.id
        const postid = 42
        const type = option.type
        state.set({
            postid: postid,
            type: type
        })
        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                windowWidth: result.windowWidth,
                windowHeight: result.windowHeight -165
            })
        })

        app.login().then(result => {
            http(wx.request)({
                url: `${config.community}/v5/topic/${postid}`,
                header: { 'Authorization': result }
            }).then(res => {
                this.setData({
                    topicInfo: res.data
                })
            })
            this.getTopics(true)
        })
    },
    getTopics (boolean) {
        const authorization = state.get('authorization')
        // const postid = state.get('postid')
        const postid = 42
        const _topic = `${config.community}/v5/topic/${postid}/tweets`
        const pageSize = 10

        if (boolean) {
            return getData(this, {
                url: _topic,
                data: {
                    pageCount: 1,
                    pageSize: pageSize
                },
                header: { 'Authorization': authorization }
            }, true)
        }
        return getData(this, {
            url: _topic,
            data: {
                pageCount: this.data.pageCount + 1,
                pageSize: pageSize
            },
            header: { 'Authorization': authorization }
        })
    },
    navToPost (event) {
        const dataset = event.currentTarget.dataset
        wx.navigateTo({
            url: `../post/post?id=${dataset.objectid}&type=${dataset.type}`
        })
    },
    upLoad () {
        this.data.enableUpLoadMore && this.getTopics()
    },
    onShareAppMessage (option) {
        const postTitle = this.data.topicInfo.name
        const id = state.get('postid')
        const type = state.get('type')
        const path = `/${this.__route__}?id=${id}&type=${type}`

        return {
            title: postTitle,
            path: path
        }
    }
})
