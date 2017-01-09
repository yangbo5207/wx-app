import config from '../../utils/config'
import state from '../../utils/state'
import { http, formatTime } from '../../utils/utils'
import { getData } from '../../components/upLoadMore/upLoadMore'

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0,
        placeholder: '回复',
        inputValue: '',
        inputFocus: false,
        tips: 'none',
        tipsContent: '',
        commentType: 1,  // 回复对象的type
        commentID: 0,     // 回复对象的objectID
        curCommentIndex: 0
    },
    onLoad: function () {
        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                windowWidth: result.windowWidth,
                windowHeight: result.windowHeight - 50,
                commentType: state.get('type'),
                commentID: state.get('postid')
            })
        })
        this.getComments(true)
    },
    // if boolean == true, mean it is first loading
    getComments (boolean) {
        const authorization = state.get('authorization')
        const postid = state.get('postid')
        const type = state.get('type')
        const _comments = `${config.community}/v5/object/${type}/${postid}/comments`
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
                    item.html = item.html.replace(/<[^<>]*>/g, '')
                    if (item.subComments.length > 0) {
                        item.subComments.map (cot => {
                            cot.html = cot.html.replace(/<[^<>]*>/g, '')
                            return cot
                        })
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
                item.html = item.html.replace(/<[^<>]*>/g, '')
                if (item.subComments.length > 0) {
                    item.subComments.map (cot => {
                        cot.html = cot.html.replace(/<[^<>]*>/g, '')
                        return cot
                    })
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
        this.data.enableUpLoadMore && this.getComments()
    },
    input (event) {
        this.setData({
            inputValue: event.detail.value
        })
    },
    commentSend () {
        const authorization = state.get('authorization')
        const type = this.data.commentType
        const postid = this.data.commentID

        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }

        return http(wx.request)({
            url: `${config.community}/v5/comment`,
            method: 'POST',
            data: {
                objectId: postid,
                type: type,
                content: this.data.inputValue            },
            header: {
                Authorization: authorization,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })
        .then(result => {
            let comments = this.data.dataList
            result.data.author = state.get('author')
            result.data.html = result.data.html.replace(/<[^<>]*>/g, '')
            if (type == 3) {
                comments[this.data.curCommentIndex].subComments.push(result.data)
            } else {
                let commentSize = state.get('commentSize') + 1
                result.data.gmtCreate = formatTime(result.data.gmtCreate)
                comments.unshift(result.data)
                state.set({
                    commentSize: commentSize
                })
                state.dispatch('changeCommentCount', commentSize)
            }

            this.setData({
                dataList: comments,
                inputValue: '',
                commentType: state.get('type')
            })
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
        let dataset = event.currentTarget.dataset
        this.setData({
            placeholder: `回复 ${dataset.name}`,
            curCommentIndex: dataset.index,
            commentType: 3,
            inputFocus: true,
            commentID: dataset.id
        })
    },
    reCommentSub (event) {
        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }
        let dataset = event.currentTarget.dataset
        this.setData({
            inputFocus: true,
            inputValue: `@${dataset.name} `,
            commentType: 3,
            curCommentIndex: dataset.pindex,
            commentID: dataset.id
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
            url: `${config.community}/v5/object/3/${commentid}/like`,
            method: 'POST',
            header: {
                Authorization: authorization
            }
        })
    }
})
