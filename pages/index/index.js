let app = getApp()

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        recommendList: [],
        isBottomLoading: "none",
        isBottomEnd: "none",
        windowWidth: 0,
        windowHeight: 0,
        pageCount: 1,
        enable: 1
    },

    onLoad: function () {
        this.showPage();
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight
                })
            }
        })
    },

    onPullDownRefresh: function () {
        this.onLoad()
    },

    navToPost: function (event) {
        console.log(event.target.dataset.src.match(/tweet\/\d+/)[0].slice(6))
        app.globalData.postid = event.target.dataset.src.match(/tweet\/\d+/)[0].slice(6)
        wx.navigateTo({
            url: '../post/post'
        })
    },

    upLoad: function () {
        var self = this

        if(self.data.enable) {
            this.setData({
                isBottomLoading: 'flex',
                pageCount: self.data.pageCount + 1 
            })
            wx.request({
                url: 'https://test-frontend-community.laohu8.com/v5/tweets/highlighted',
                data: {
                    pageCount: self.data.pageCount,
                    pageSize: 20
                },
                header: {
                    // 'Authorization': 'Bearer 52gIBGxCzUjkJoCk6ZRvZ84K6lhzBQv6HASo19jiM4rpON****'
                    'Authorization': 'Bearer JH3waLHzoCdUoUclDFkyIwU92Oen79U4ivJrKGJYE9TCmT****'
                },
                success: function (res) {
                    if(res.data.data) {
                        res.data.data.map( item => {
                            if(item.text.length > 60) {
                                item.text = item.text.slice(0, 60) + '... ...'
                            }
                            return item
                        })
                        self.setData({
                            recommendList: self.data.recommendList.concat(res.data.data),
                            isBottomLoading: 'none'
                        })
                    }
                    if(res.data.message) {
                        self.setData({
                            isBottomLoading: 'none',
                            isBottomEnd: 'flex',
                            enable: 0
                        })
                    }
                }
            })
        }
    },

    showPage: function () {
        let self = this
        if(self.data.enable) {
            wx.showToast({
                title: '加载中...',
                icon: 'loading',
                duration: 100000
            })
            wx.request({
                url: 'https://test-frontend-community.laohu8.com/v5/tweets/highlighted',
                data: {
                    pageCount: self.data.pageCount,
                    pageSize: 20
                },
                header: {
                    // 'Authorization': 'Bearer 52gIBGxCzUjkJoCk6ZRvZ84K6lhzBQv6HASo19jiM4rpON****'
                    'Authorization': 'Bearer JH3waLHzoCdUoUclDFkyIwU92Oen79U4ivJrKGJYE9TCmT****'
                },
                success: function (res) {
                    setTimeout( () => {
                        wx.hideToast()
                    }, 500)
                    if(res.data.data) {
                        res.data.data.map( item => {
                            if(item.text.length > 60) {
                                item.text = item.text.slice(0, 60) + '... ...'
                            }
                            return item
                        })
                        self.setData({
                            recommendList: res.data.data
                        })
                    } else {
                        setTimeout( () => {
                            wx.showModal({
                                title: "提示",
                                content: "错误码:" + res.statusCode,
                                confirmText: "重新加载",
                                success: function (res) {
                                    if(res.confirm) {
                                        self.showPage();
                                    }
                                }
                            })
                        }, 500)
                    }
                },
                fail: function () {
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
        }  
    }
})