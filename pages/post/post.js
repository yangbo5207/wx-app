import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../components/wxParse/wxParse'
import { http, assign, formatTime } from '../../utils/utils'
import actionsBar from '../../components/actionsBar/actionsBar'

const app = getApp()

Page({
    data: {
        post: {},
        like: 0,
        favorite: 0,
        commentSize: 0
    },
    onLoad (option) {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })

        const authorization = state.get('authorization')
        const postid = option.id
        const type = option.type
        const postURL = `${config.community}/v5/tweet/${postid}`
        state.set({
            postid: postid,
            type: type
        })
        assign(this, actionsBar.optionFn)

        app.login().then(result => {
            this.initialAction()
            http(wx.request)({
                url: postURL,
                header: { 'Authorization': result }
            }).then(res => {
                wx.hideToast();
                const article = res.data.content
                http(wx.getSystemInfo)()
                .then(systemInfo => {
                    WxParse.wxParse('article', 'html', article, this, 0.04 * systemInfo.windowWidth);
                })
                res.data.gmtCreate = formatTime(res.data.gmtCreate)
                this.setData({
                    post: res.data,
                    commentSize: res.data.commentSize,
                    likeSize: res.data.likeSize
                })
            })
            .catch(result => {
                wx.hideToast();
                if (result.status) {
                    http(wx.showModal)({
                        title: "提示",
                        content: "错误码:" + result.status,
                        confirmText: "重新加载"
                    }).then(res => {
                        if(res.confirm) { this.onLoad() }
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '网络好像出了点问题'
                    })
                }
            })
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
    },
    onShareAppMessage (option) {
        const postTitle = this.data.post.title
        const id = state.get('postid')
        const type = state.get('type')
        const path = `/${this.__route__}?id=${id}&type=${type}`

        return {
            title: postTitle,
            path: path
        }
    }
})
