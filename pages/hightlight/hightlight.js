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
        const postURL = `${config.news}/highlight`

        Object.assign(this, actionsBar.optionFn)
        this.initialAction()

        http(wx.request)({
            url: postURL,
            data: {
                id: postid,
                wx: 1
            }
        })
        .then( result => {
            wx.hideToast();
            const article = result.content
            http(wx.getSystemInfo)()
            .then(systemInfo => {
                WxParse.wxParse('article', 'html', article, this, 0.04 * systemInfo.windowWidth);
            })
            this.setData({
                post: result
            })
        })
        .catch(result => {
            wx.showModal({
                title: '提示',
                content: '好像网络出了点状况'
            })
        })

        http(wx.request)({
            url: `${config.communityDomainDev}/v5/object/4/${postid}/comments`,
            header: {
                Authorization: authorization
            },
            data: {
                pageSize: 1
            }
        })
        .then( result => {
            this.setData({
                commentSize: result.totalSize
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
    }
})
