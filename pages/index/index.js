import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

const app = getApp()

Page({
    data: {
        recommendList: [],
        isBottomLoading: "none",
        isBottomEnd: "none",
        windowWidth: 0,
        windowHeight: 0,
        pageCount: 1,  // 数据的页码
        enable: 1      // 是否还能下拉刷新
    },
    onLoad () {
        const authorization = state.get('authorization')
        if(authorization) {
            this.getRecommendList(true);
        } else {
            app.login()
            .then(() => {
                this.getRecommendList(true);
            })
        }
        promise(wx.getSystemInfo)()
        .then( res => {
            this.setData({
                windowWidth: res.windowWidth,
                windowHeight: res.windowHeight
            })
        })
    },
    onPullDownRefresh () {
        this.getRecommendList(true)
    },
    navToPost (event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: event.currentTarget.dataset.type
        })
        wx.navigateTo({
            url: '../post/post'
        })
    },
    navToNews (event) {
        const dataset = event.currentTarget.dataset
        state.set({
            postid: dataset.objectid,
            type: dataset.type
        })
        wx.navigateTo({
            url: '../hightlight/hightlight'
        })
    },
    navToPrediction (event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: event.currentTarget.dataset.type
        })
        wx.navigateTo({
            url: '../prediction/prediction'
        })
    },
    navToTopic (event) {
        state.set({
            postid: event.currentTarget.dataset.objectid,
            type: event.currentTarget.dataset.type
        })
        wx.navigateTo({
            url: '../topic/topic'
        })
    },
    getRecommendList (boolean) {
        const authorization = state.get('authorization')
        let pageCount;

        if(!this.data.enable) {
            return;
        }

        if (boolean === true) {
            wx.showToast({
                title: '加载中...',
                icon: 'loading',
                duration: 100000
            })
            pageCount = 1;
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
            url: `${config.communityDomainDev}/v5/streamings`,
            data: {
                pageCount: this.data.pageCount,
                pageSize: 10
            },
            header: {
                'Authorization': authorization
            }
        })
        .then(result => {
            // if(result.statusCode == 200) {
            if(result.data) {
                if(boolean === true) {
                    delayHideToast()
                    this.setData({
                        recommendList: result.data
                    })
                } else {
                    this.setData({
                        recommendList: this.data.recommendList.concat(result.data),
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
            console.log('index页面加载完成')
        }, result => {
            delayHideToast();
            console.log('index feed error message:', result)
            if (result.status) {
                promise(wx.showModal)({
                    title: "提示",
                    content: "错误码:" + result.status,
                    confirmText: "重新加载"
                })
                .then(res => {
                    if(res.confirm) {
                        this.getRecommendList();
                    }
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
    // 下拉加载更多
    upLoad () {
        this.getRecommendList()
    }
})
