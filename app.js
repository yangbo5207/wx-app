App({
    onLaunch: function () {
        let logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
    },
    getUserInfo: function (cb) {
        let self = this
        if(self.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            wx.login({
                success: function (res) {
                    wx.request({
                        url: 'https://api.weixin.qq.com/sns/jscode2session',
                        data: {
                            appid: 'wx87ef8d5ebed00eed',
                            secret: '5746108f85fe52594b1639bbd9d5abe9',
                            js_code: res.code,
                            grant_type: 'authorization_code'
                        },
                        success: function (res) {

                        }
                    })
                }
            })
            wx.getUserInfo({
                success: function (res) {
                    self.globalData.userInfo = res.userInfo
                    typeof cb == "function" && cb(self.globalData.userInfo)
                }
            })
        }
    },
    globalData: {
        userInfo: null,
        postid: '' 
    }
})