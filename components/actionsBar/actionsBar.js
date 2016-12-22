import state from '../../utils/state'
import config from '../../utils/config'
import { http } from '../../utils/utils'

const options = {
    initialAction () {
        let actions = state.get('actions')
        const postid = state.get('postid')
        const cur = `1:${postid}`
        const type = state.get('type')

        if(actions.like.indexOf(cur) > -1) {
            this.setData({ like: 1 })
        }
        if(actions.favorite.indexOf(cur) > -1) {
            this.setData({ favorite: 1 })
        }
        this.setData({ type: type })
    },
    setLike () {
        const postid = state.get('postid')
        const authorization = state.get('authorization')

        let like = this.data.like

        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

        if(!like) {
            this.setData({
                like: 1,
                likeSize: this.data.likeSize + 1
            })

            let likes = state.get('actions').like
            likes.push(`1:${postid}`)

            state.set({
                actions: {
                    like: likes
                }
            })
            http(wx.showToast)({
                title: '已点赞',
                icon: 'success'
            })
            .then( () => {
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
            })

            http(wx.request)({
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

        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

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

            http(wx.showToast)({
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

            http(wx.showToast)({
                title: '已取消收藏',
                icon: 'success'
            })
            .then( () => {
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
            })
        }


        http(wx.request)({
            url: `${config.communityDomainDev}/v5/object/1/${postid}/favorite`,
            method: method,
            header: { Authorization: authorization }
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
}

module.exports = {
    optionFn: options
}
