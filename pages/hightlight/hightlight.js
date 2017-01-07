import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../components/wxParse/wxParse'
import { http, assign } from '../../utils/utils'
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
        const postURL = `${config.news}/highlight`
        state.set({
            postid: postid,
            type: type
        })
        assign(this, actionsBar.optionFn)

        app.login().then(result => {
            this.initialAction()
            http(wx.request)({
                url: `${config.community}/v5/object/4/${postid}/comments`,
                header: {
                    Authorization: result
                },
                data: {
                    pageSize: 1
                }
            }).then( result => {
                wx.hideToast()
                this.setData({
                    commentSize: result.totalSize
                })
            })
        })

        http(wx.request)({
            url: postURL,
            data: {
                id: postid,
                wx: 1
            }
        }).then( result => {
            wx.hideToast();
            const article = result.content
            http(wx.getSystemInfo)()
            .then(systemInfo => {
                WxParse.wxParse('article', 'html', article, this, 0.04 * systemInfo.windowWidth);
            })
            this.setData({
                post: result
            })
        }).catch(result => {
            wx.showModal({
                title: '提示',
                content: '好像网络出了点状况'
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
