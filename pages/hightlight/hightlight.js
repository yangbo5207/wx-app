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
        const postURL = `${config.news}/highlight`

        promise(wx.request)({
            url: postURL,
            data: {
                id: postid,
                wx: 1
            }
        })
        .then( result => {
            wx.hideToast();
            const article = result.content
            promise(wx.getSystemInfo)()
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

        promise(wx.request)({
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

        let actions = state.get('actions')
        let cur = `1:${postid}`

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
    setFavorite () {
        const self = this
        const postid = state.get('postid')
        const authorization = state.get('authorization')

        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

        triggerFavorite()

        function triggerFavorite () {
            let favorite = self.data.favorite
            let method;

            if(!favorite) {
                method = 'POST'
                self.setData({
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
                self.setData({
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
        }
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
