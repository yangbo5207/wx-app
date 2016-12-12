import config from '../../utils/config'

const app = getApp()

Page({
    data: {
        topicInfo: {},
        topicList: []
    },
    onLoad () {
        const self = this
        app.globalData.postid = 42
        wx.request({
            url: `${config.communityDomainDev}/v5/topic/${app.globalData.postid}`,
            header: {
                'Authorization': 'Bearer JH3waLHzoCdUoUclDFkyIwU92Oen79U4ivJrKGJYE9TCmT****'
            },
            success: result => {
                self.setData({
                    topicInfo: result.data.data
                })
            }
        })
        wx.request({
            url: `${config.communityDomainDev}/v5/topic/${app.globalData.postid}/tweets`,
            header: {
                'Authorization': 'Bearer JH3waLHzoCdUoUclDFkyIwU92Oen79U4ivJrKGJYE9TCmT****'
            },
            success: result => {
                self.setData({
                    topicList: result.data.data
                })
            }
        })
    },
    navToPost(event) {
        app.globalData.postid = event.target.dataset.objectid
        wx.navigateTo({
            url: '../post/post'
        })
    },
})