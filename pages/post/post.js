import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../wxParse/wxParse'
import { promise } from '../../utils/utils'

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

        promise(wx.request)({
            url: postURL,
            header: { 'Authorization': authorization }
        })
        .then(res => {
            wx.hideToast();
            const article = res.data.data.content
            promise(wx.getSystemInfo)()
            .then(systemInfo => {
                WxParse.wxParse('article', 'html', article, this, 0.04*systemInfo.windowWidth);
            })
            this.setData({
                post: res.data.data,
                commentSize: res.data.data.commentSize
            })
        })
        .catch(() => {
            wx.showModal({
                title: '提示',
                content: '与服务器断开连接，请检查是否为网络问题'
            })
        })

        let actions = state.get('actions')
        const cur = `1:${postid}`

        if(actions.like.indexOf(cur) > -1) {
            this.setData({ like: 1 })
        }
        if(actions.favorite.indexOf(cur) > -1) {
            this.setData({ favorite: 1 })
        }

        state.bind('changeCommentCount', this.changeCommentCount, this)
    },
    changeCommentCount (newCount) {
        this.setData({
            commentSize: newCount
        })
    },
    setLike () {
        const postid = state.get('postid')
        const authorization = state.get('authorization')
        
        let like = this.data.like
        if(!like) {
            this.setData({
                like: 1,
                post: {
                    likeSize: this.data.post.likeSize + 1
                }
            })

            let likes = state.get('actions').like
            likes.push(`1:${postid}`)

            state.set({
                actions: {
                    like: likes
                }
            })
            promise(wx.showToast)({
                title: '已点赞',
                icon: 'success'
            })
            .then( () => {
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
            })

            promise(wx.request)({
                url: `${config.communityDomainDev}/v5/object/1/${postid}/like`,
                method: 'POST',
                header: { Authorization: authorization }
            })
        }
    },
    setFavorite () {
        const postid = state.get('postid')
        const authorization = state.get('authorization')
        let favorite = this.data.favorite
        let method;

        if(!favorite) {
            method = 'POST'
            this.setData({
                favorite: 1
            })

            let favorites = state.get('actions').favorite
            favorites.push(`1:${postid}`)

            state.set({
                actions: {
                    favorite: favorites
                }
            })

            promise(wx.showToast)({
                title: '已收藏',
                icon: 'success'
            })
            .then( () => {
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
            })

        } else {
            method ='DELETE'
            this.setData({
                favorite: 0
            })

            let favorites = state.get('actions').favorite
            favorites.splice(favorites.indexOf(`1:${postid}`), 1)
            state.set({
                actions: {
                    favorite: favorites
                }
            })

            promise(wx.showToast)({
                title: '已取消收藏',
                icon: 'success'
            })
            .then( () => {
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
            })
        }


        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/object/1/${postid}/favorite`,
            method: method,
            header: { Authorization: authorization }
        })
    },
    navToComment () {
        const _this = this
        state.set({
            commentSize: _this.data.commentSize
        })
        wx.navigateTo({
            url: '../comment/comment'
        })
    } 
})
