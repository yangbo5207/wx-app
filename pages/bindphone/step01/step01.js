import { http } from '../../../utils/utils'
import state from '../../../utils/state'
import config from '../../../utils/config'

Page({
    data: {
        inputValue: ''
    },
    onLoad () {

    },
    input (event) {
        this.setData({
            inputValue: event.detail.value
        })
    },
    nextStep () {
        wx.showToast({
            title: '加载中...',
            icon: 'loading'
        })
        if (this.data.inputValue.length < 11 || !/^1[3|4|5|7|8][0-9]{9}$/.test(this.data.inputValue)) {
            wx.hideToast()
            wx.showModal({
                title: '提示',
                content: '请输入正确的手机号'
            })
            return
        }
        http(wx.request)({
            url: `${config.loginDomain}/api/v4/auth/sns/snsbind/status`,
            data: { username: this.data.inputValue }
        })
        .then(result => {
            wx.hideToast()
            if (result.data.phone == null) {
                // console.log('该手机号未注册，跳转至注册页面')
                state.set({
                    bindPhoneNumber: this.data.inputValue
                })
                wx.redirectTo({
                    url: '../step02/step02'
                })
            }
            if (result.data.phone == this.data.inputValue && !result.data.sns_status.wxapp_bingding) {
                // console.log('该手机号已注册，但是未绑定小程序，跳转至绑定页面')
                state.set({
                    bindPhoneNumber: this.data.inputValue
                })
                wx.redirectTo({
                    url: '../step12/step12'
                })
            }
            if (result.data.phone == this.data.inputValue && result.data.sns_status.wxapp_bingding) {
                wx.showModal({
                    title: '提示',
                    content: '该手机号已经绑定了其他小程序'
                })
            }
        })
    }
})
