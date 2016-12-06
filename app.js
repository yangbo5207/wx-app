//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res) {
          // console.log(res);
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            data: {
              appid: 'wx87ef8d5ebed00eed',
              secret: '5746108f85fe52594b1639bbd9d5abe9',
              js_code: res.code,
              grant_type: 'authorization_code'
            },
            success: function(res) {
              // console.log(res);
            }
          })
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  }
})