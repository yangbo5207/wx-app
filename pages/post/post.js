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
                console.log(res)
                var article = res.data.data.content
                WxParse.wxParse('article', 'html', article, self, 5);
                self.setData({
                    post: res.data.data
                })
            }
        })
    }
})