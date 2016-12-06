let app = getApp()

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        recommendList: []
    },

    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },

    onLoad: function () {
        console.log('onLoad')
        let self = this
        app.getUserInfo( userInfo => {
            self.setData({
                userInfo: userInfo
            })
        })

        wx.request({
            url: 'https://test-frontend-community.laohu8.com/v5/tweets/highlighted',
            data: {
                pageCount: 1,
                pageSize: 20,
                timeout: 3000
            },
            header: {
                'Authorization': 'Bearer 52gIBGxCzUjkJoCk6ZRvZ84K6lhzBQv6HASo19jiM4rpON****'
            },
            success: function (res) {
                self.setData({
                    recommendList: res.data.data
                })
            },
            fail: function () {
                console.log(arguments)
            },
            complete: function () {
                console.log('xxx')
            }
        })
    }
})