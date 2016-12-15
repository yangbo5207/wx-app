import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

const postid = 6711
const type = 1

Page({
    data: {
        comments: [],
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
        const _this = this
        const authorization = state.get('authorization')

        promise(wx.getSystemInfo)()
        .then(result => {
            _this.setData({
                commentWrapHeight: result.windowHeight - 50
            })
        })

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/object/1/${postid}/comments`,
            data: {
                pageCount: 1,
                pageSize: 10
            },
            header: { 'Authorization': authorization }
        })
        .then( result => {
            const res = result.data
            if (res.totalSize == 0) {
                _this.setData({
                    isNone: 'flex'
                })
                return
            } 
            let actions = state.get('actions')
            let comments = res.data.map( item => {
                const a = `3:${item.id}`
                if(actions.like.indexOf(a) > -1) {
                    item.like = 1
                } else {
                    item.like = 0
                }
                return item 
            })

            _this.setData({
                comments: comments
            })
        })
    },
    input (event) {
        this.setData({
            inputValue: event.detail.value
        })
    },
    commentSend () {
        const _this = this
        const authorization = state.get('authorization')

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/comment`,
            method: 'POST',
            data: {
                objectId: postid,
                type: type,
                content: encodeURIComponent(_this.data.inputValue)
            },
            header: { 
                Authorization: authorization,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })   
        .then(res => {
            if(res.statusCode == 200) {
                let comments = _this.data.comments
                res.data.data.author = state.get('author')
                comments.unshift(res.data.data)
                _this.setData({
                    comments: comments,
                    inputValue: ''
                })
            } else {
                _this.setData({
                    tips: 'block',
                    tipsContent: res.data.message
                })

                setTimeout( () => {
                    _this.setData({
                        tips: 'none',
                        tipsContent: ''
                    })  
                }, 1000)
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
        const _this = this
        const commentid = event.currentTarget.dataset.id
        const authorization = state.get('authorization')
        const cur = `3:${commentid}`

        // 判断当前评论是否已经点赞
        function isCurrentLike(cur) {
            let isLike = false
            _this.data.comments.map(item => {
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
        let comments = _this.data.comments.map (item => {
            if(`3:${item.id}` == cur) {
                item.like = 1
                item.likeSize = item.likeSize + 1
            }
            return item
        })
        _this.setData({
            comments: comments
        })

        wx.showToast({
            title: '已点赞',
            icon: 'success',
            duration: 1000
        })

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/object/3/${`commentid`}/like`,
            method: 'POST',
            header: {
                Authorization: authorization
            }
        })
    }
})
