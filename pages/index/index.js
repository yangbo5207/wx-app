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
        enable: 1
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
            if(result.statusCode == 200) {
                if(result.data.data) {
                    if(boolean === true) {
                        setTimeout( () => {
                            wx.hideToast()
                        }, 500)
                        this.setData({
                            recommendList: result.data.data
                        })
                    } else {
                        this.setData({
                            recommendList: this.data.recommendList.concat(result.data.data),
                            isBottomLoading: 'none'
                        })
                    }
                } else if (result.data.message) {
                    this.setData({
                        isBottomLoading: 'none',
                        isBottomEnd: 'flex',
                        enable: 0
                    })
                }
            } else {
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
                promise(wx.showModal)({
                    title: "提示",
                    content: "错误码:" + result.statusCode,
                    confirmText: "重新加载"
                })
                .then(res => {
                    if(res.confirm) {
                        this.getRecommendList();
                    }
                })
            }
            console.log('index页面加载完成')
        }, () => {
            // 未连接到服务器，请检测是否为网络问题
            setTimeout( () => {
                wx.hideToast()
            }, 500)
            wx.showModal({
                title: "提示",
                content: "未连接到服务器，请检测是否为网络问题"
            })
        })
    },
    // 下拉加载更多
    upLoad () {
        this.getRecommendList()
    }
})