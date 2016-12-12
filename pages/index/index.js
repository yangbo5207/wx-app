import config from '../../utils/config'
import state from '../../utils/state'

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
        this.getRecommendList(true);
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight
                })
            }
        })
    },
    onPullDownRefresh () {
        this.getRecommendList(true)
    },
    navToPost (event) {
        state.set('postid', event.target.dataset.objectid)
        wx.navigateTo({
            url: '../post/post'
        })
    },
    navToPrediction (event) {
        state.set('postid', event.target.dataset.objectid)
        wx.navigateTo({
            url: '../prediction/prediction'
        })
    },
    navToTopic (event) {
        state.set('postid', event.target.dataset.objectid)
        wx.navigateTo({
            url: '../topic/topic'
        })
    },

    getRecommendList (boolean) {
        const self = this
        const authorization = state.get('authorization')
        let pageCount;

        if(!self.data.enable) {
            return;
        }

        if (boolean === true) {
            wx.showToast({
                title: '加载中...',
                icon: 'loading',
                duration: 100000
            })
            pageCount = 1;
            self.setData({
                pageCount: pageCount
            })
        } else {
            self.setData({
                isBottomLoading: 'flex',
                pageCount: self.data.pageCount + 1
            })
        }

        wx.request({
            url: `${config.communityDomainDev}/v5/streamings`,
            data: {
                pageCount: self.data.pageCount,
                pageSize: 10
            },
            header: {
                'Authorization': authorization
            },
            success (result) {
                console.log(self.data.pageCount)
                if(result.data.data) {
                    if(boolean === true) {
                        setTimeout( () => {
                            wx.hideToast()
                        }, 500)
                        self.setData({
                            recommendList: result.data.data
                        })
                    } else {
                        self.setData({
                            recommendList: self.data.recommendList.concat(result.data.data),
                            isBottomLoading: 'none'
                        })
                    }
                } else if (result.data.message) {
                    self.setData({
                        isBottomLoading: 'none',
                        isBottomEnd: 'flex',
                        enable: 0
                    })
                } else {
                    setTimeout( () => {
                        wx.showModal({
                            title: "提示",
                            content: "错误码:" + result.statusCode,
                            confirmText: "重新加载",
                            success: function (res) {
                                if(result.confirm) {
                                    self.getRecommendList();
                                }
                            }
                        })
                    }, 500)
                }
            },
            fail () {
                // 未连接到服务器，请检测是否为网络问题
                setTimeout( () => {
                    wx.hideToast()
                }, 500)
                wx.showModal({
                    title: "提示",
                    content: "未连接到服务器，请检测是否为网络问题",
                    confirmText: "重新加载",
                    success: function (res) {
                        if(res.confirm) {
                            self.showPage();
                        }
                    }
                })
            }
        })
    },
    // 下拉加载更多
    upLoad () {
        this.getRecommendList()
    }
})