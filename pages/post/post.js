let app = getApp(),
    WxParse = require('../../wxParse/wxParse')

Page({
    data: {
        post: {}
    },
    onLoad: function () {
        let self = this,
            _url = 'https://test-frontend-community.laohu8.com/v5/tweet/' + app.globalData.postid;

            wx.request({
                url: _url,
                header: {
                    // 'Authorization': 'Bearer 52gIBGxCzUjkJoCk6ZRvZ84K6lhzBQv6HASo19jiM4rpON****'
                    'Authorization': 'Bearer JH3waLHzoCdUoUclDFkyIwU92Oen79U4ivJrKGJYE9TCmT****'
                },
                success: function (res) {
                    let article = res.data.data.content
                    wx.getSystemInfo({
                        success: systemInfo => {
                            WxParse.wxParse('article', 'html', article, self, 0.04*systemInfo.windowWidth);
                        }
                    })
                    self.setData({
                        post: res.data.data
                    })
                }
            })
    }
})