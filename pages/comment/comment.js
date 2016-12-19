import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

Page({
    data: {
        comments: [],
        pageCount: 1,
        enable: 1,
        isBottomLoading: 'none',
        isBottomEnd: 'none',
        isNone: 'none',
        isBottom: 'none',
        placeholder: '回复',
        commentWrapHeight: 0,
        inputValue: '',
        inputFocus: false,
        tips: 'none',
        tipsContent: ''
    },
    onLoad: function () {
        const authorization = state.get('authorization')
        const postid = state.get('postid')
        const type = state.get('type')

        promise(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                commentWrapHeight: result.windowHeight - 50
            })
        })

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/object/${type}/${postid}/comments`,
            data: {
                pageCount: 1,
                pageSize: 10
            },
            header: { 'Authorization': authorization }
        })
        .then( result => {
            if (result.totalSize == 0) {
                this.setData({
                    isNone: 'flex'
                })
                return
            }
            let actions = state.get('actions')
            let comments = result.data.map( item => {
                const a = `3:${item.id}`
                if(actions.like.indexOf(a) > -1) {
                    item.like = 1
                } else {
                    item.like = 0
                }
                return item
            })

            this.setData({
                comments: comments
            })
        })
        .catch( () => {
            this.setData({
                isNone: 'flex'
            })
        })
    },
    // if boolean == true, mean it is first loading
    getComments (boolean) {
        const authorization = state.get('authorization')
        let pageCount;
    
        if (this.data.enable) { return }

        if (boolean === true) {
            wx.showToast({
                title: '加载中...',
                icon: 'loading',
                duration: 100000
            })
            pageCount = 1
            this.setData({
                pageCount: pageCount
            })
        } else {
            this.setData({
                isBottomLoading: 'flex',
                pageCount: this.data.pageCount + 1
            })
        }

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/object/${type}/${postid}/comments`,
            data: {
                pageCount: 1,
                pageSize: 10
            },
            header: { 'Authorization': authorization }
        })
        .then(result => {
            if (result.data) {
                if (boolean === true) {
                    delayHideToast()
                    this.setData({
                        comments: result.data
                    })
                } else {
                    this.setData({
                        comments: this.data.comments.concat(result.data),
                        isBottomLoading: 'none'
                    })
                }
            } else if (result.message) {
                this.setData({
                    isBottomLoading: 'none',
                    isBottomEnd: 'flex',
                    enable: 0
                })
            }
        })
        .catch( result => {
            delayHideToast()
            if (result.status) {
                promise(wx.showModal)({
                    title: '提示',
                    content: '错误码：' + result.status
                })
            } else {
                wx.showModal({
                    title: "提示",
                    content: "未连接到服务器，请检测是否为网络问题"
                })
            }
        })

        function delayHideToast() {
            setTimeout( () => {
                wx.hideToast()
            }, 500)
        }
    },
    input (event) {
        this.setData({
            inputValue: event.detail.value
        })
    },
    commentSend () {
        const authorization = state.get('authorization')
        const postid = state.get('postid')
        const type = state.get('type')

        return promise(wx.request)({
            url: `${config.communityDomainDev}/v5/comment`,
            method: 'POST',
            data: {
                objectId: postid,
                type: type,
                content: encodeURIComponent(this.data.inputValue)
            },
            header: {
                Authorization: authorization,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })
        .then(result => {
            let comments = this.data.comments
            let commentSize = state.get('commentSize') + 1

            result.data.author = state.get('author')
            comments.unshift(result.data)
            this.setData({
                comments: comments,
                inputValue: '',
                isNone: 'none'
            })

            state.set({
                commentSize: commentSize
            })
            state.dispatch('changeCommentCount', commentSize)
        })
        .catch ( result => {
            if (result.status) {
                this.setData({
                    tips: 'block',
                    tipsContent: result.message
                })
                setTimeout( () => {
                    this.setData({
                        tips: 'none',
                        tipsContent: ''
                    })
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '网络好像出了点问题'
                })
            }
        })
    },
    recomment (event) {
        this.setData({
            placeholder: `回复 ${event.target.dataset.name}`,
            inputFocus: true
        })
    },
    inputblur (event) {
        this.setData({
            placeholder: '回复'
        })
    },
    likeComment (event) {
        const commentid = event.currentTarget.dataset.id
        const authorization = state.get('authorization')
        const cur = `3:${commentid}`

        // 判断当前评论是否已经点赞
        const isCurrentLike = cur => {
            let isLike = false
            this.data.comments.map(item => {
                if(cur == `3:${item.id}` && item.like == 1) {
                    isLike = true
                }
            })
            return isLike
        }

        if(isCurrentLike(cur)) {
            return;
        }

        // save to states
        let likes = state.get('actions').like
        likes.push(cur)
        state.set({
            actions: { like: likes }
        })

        // update ui
        let comments = this.data.comments.map (item => {
            if(`3:${item.id}` == cur) {
                item.like = 1
                item.likeSize = item.likeSize + 1
            }
            return item
        })
        this.setData({
            comments: comments
        })

        wx.showToast({
            title: '已点赞',
            icon: 'success',
            duration: 1000
        })

        return promise(wx.request)({
            url: `${config.communityDomainDev}/v5/object/3/${commentid}/like`,
            method: 'POST',
            header: {
                Authorization: authorization
            }
        })
    }
})
