import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'
import { getData } from '../../components/pullDownRefresh/pullDownRefresh'

const app = getApp()

Page({
    data: {
        topicInfo: {},
        topicList: [],
        windowWidth: 0,
        windowHeight: 0
    },
    onLoad () {
        // const postid = state.get('postid')
        const postid = 42
        const authorization = state.get('authorization')

        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                windowWidth: result.windowWidth,
                windowHeight: result.windowHeight -110
            })
        })

        http(wx.request)({
            url: `${config.communityDomainDev}/v5/topic/${postid}`,
            header: {
                'Authorization': authorization
            }
        })
        .then( result => {
            this.setData({
                topicInfo: result.data
            })
        })

        this.getTopics(true)
    },
    getTopics (boolean) {
        const authorization = state.get('authorization')
        // const postid = state.get('postid')
        const postid = 42
        const _topic = `${config.communityDomainDev}/v5/topic/${postid}/tweets`
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
    navToPost(event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: 1
        })
        wx.navigateTo({
            url: '../post/post'
        })
    },
    upLoad () {
        this.data.enablePullDownRefresh && this.getTopics()
    }
})
