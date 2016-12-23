import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../wxParse/wxParse'
import { http } from '../../utils/utils'
import actionsBar from '../../components/actionsBar/actionsBar'

Page({
    data: {
        post: {},
        like: 0,
        favorite: 0,
        commentSize: 0
    },
    onLoad () {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })

        const postid = state.get('postid')
        const authorization = state.get('authorization')
        const postURL = `${config.communityDomainDev}/v5/tweet/${postid}`

        Object.assign(this, actionsBar.optionFn)
        this.initialAction()

        http(wx.request)({
            url: postURL,
            header: { 'Authorization': authorization }
        })
        .then(res => {
            wx.hideToast();
            const article = res.data.content
            http(wx.getSystemInfo)()
            .then(systemInfo => {
                WxParse.wxParse('article', 'html', article, this, 0.04 * systemInfo.windowWidth);
            })
            this.setData({
                post: res.data,
                commentSize: res.data.commentSize
            })
        })
        .catch(result => {
            if (result.status) {
                http(wx.showModal)({
                    title: "提示",
                    content: "错误码:" + result.status,
                    confirmText: "重新加载"
                })
                .then(res => {
                    if(res.confirm) {
                        this.getRecommendList();
                    }
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '网络好像出了点问题'
                })
            }
        })

        state.bind('changeCommentCount', this.changeCommentCount, this)
    },
    changeCommentCount (newCount) {
        this.setData({
            commentSize: newCount
        })
    },
    navToComment () {
        state.set({
            commentSize: this.data.commentSize
        })
        wx.navigateTo({
            url: '../comment/comment'
        })
    }
})
