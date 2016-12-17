import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

const app = getApp()

Page({
    data: {
        topicInfo: {},
        topicList: []
    },
    onLoad () {
        // const postid = state.get('postid')
        const postid = 42
        const authorization = state.get('authorization')

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/topic/${postid}`,
            header: {
                'Authorization': authorization
            }
        }) 
        .then( result => {
            this.setData({
                topicInfo: result.data.data
            })
        })

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/topic/${postid}/tweets`,
            header: {
                'Authorization': authorization
            }
        })
        .then( result => {
            this.setData({
                topicList: result.data.data
            })
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
})