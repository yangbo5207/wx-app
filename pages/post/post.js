let app = getApp(),
    WxParse = require('../../wxParse/wxParse')

Page({
    data: {
        post: {}
    },
    onLoad: function () {
        let self = this,
            _url = 'http://test-stock-tweet-backend.laohu8.com/v1/tweet/' + app.globalData.postid;

            wx.request({
                url: _url,
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
                    console.log(self.data)
                }
            })
    }
})