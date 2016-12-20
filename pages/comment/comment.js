import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'
import { getData } from '../../components/pullDownRefresh/pullDownRefresh'

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0,
        placeholder: '回复',
        inputValue: '',
        inputFocus: false,
        tips: 'none',
        tipsContent: ''
    },
    onLoad: function () {
        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                windowWidth: result.windowWidth,
                windowHeight: result.windowHeight - 50
            })
        })
        this.getComments(true)
    },
    // if boolean == true, mean it is first loading
    getComments (boolean) {
        const authorization = state.get('authorization')
        const postid = state.get('postid')
        const type = state.get('type')
        const _comments = `${config.communityDomainDev}/v5/object/${type}/${postid}/comments`
        const pageSize = 10

        if (boolean) {
            return getData(this, {
                url: _comments,
                data: {
                    pageCount: 1,
                    pageSize: pageSize
                },
                header: {
                    'Authorization': authorization
                }
            }, true)
            .then(result => {
                let actions = state.get('actions')
                let dataList = this.data.dataList.map (item => {
                    const a = `3:${item.id}`
                    if (actions.like.indexOf(a) > -1) {
                        item.like = 1
                    } else {
                        item.like = 0
                    }
                    return item
                })
                this.setData({
                    dataList: dataList
                })
            })
        }
        return getData (this, {
            url: _comments,
            data: {
                pageCount: this.data.pageCount + 1,
                pageSize: pageSize
            },
            header: {
                'Authorization': authorization
            }
        }).then(result => {
            let actions = state.get('actions')
            let dataList = this.data.dataList.map (item => {
                const a = `3:${item.id}`
                if (actions.like.indexOf(a) > -1) {
                    item.like = 1
                } else {
                    item.like = 0
                }
                return item
            })
            this.setData({
                dataList: dataList
            })
        }, result => {
            console.log('error', result)
        })
    },
    onPullDownRefresh () {
        this.getComments(true)
    },
    upLoad () {
        this.data.enablePullDownRefresh && this.getComments()
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

        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

        return http(wx.request)({
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
            let comments = this.data.dataList
            let commentSize = state.get('commentSize') + 1

            result.data.author = state.get('author')
            comments.unshift(result.data)
            this.setData({
                dataList: comments,
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
        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

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

        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

        // 判断当前评论是否已经点赞
        const isCurrentLike = cur => {
            let isLike = false
            this.data.dataList.map(item => {
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
        let dataList = this.data.dataList.map (item => {
            if(`3:${item.id}` == cur) {
                item.like = 1
                item.likeSize = item.likeSize + 1
            }
            return item
        })
        this.setData({
            dataList: dataList
        })

        wx.showToast({
            title: '已点赞',
            icon: 'success',
            duration: 1000
        })

        return http(wx.request)({
            url: `${config.communityDomainDev}/v5/object/3/${commentid}/like`,
            method: 'POST',
            header: {
                Authorization: authorization
            }
        })
    }
})
