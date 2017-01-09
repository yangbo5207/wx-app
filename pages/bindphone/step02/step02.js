import { http } from '../../../utils/utils'
import state from '../../../utils/state'
import config from '../../../utils/config'

Page({
    data: {
        isEncryption: 1,
        inputNumberValue: '',
        inputPasswordValue: ''
    },
    onLoad () {
        this.setData({
            inputNumberValue: state.get('bindPhoneNumber')
        })
    },
    inputNumber (event) {
        this.setData({
            inputNumberValue: event.detail.value
        })
    },
    inputPassword (event) {
        this.setData({
            inputPasswordValue: event.detail.value
        })
    },
    clearNumberValue () {
        this.setData({
            inputNumberValue: ''
        })
    },
    switchEncryption () {
        this.setData({
            isEncryption: !this.data.isEncryption
        })
    },
    navToDisclaimer () {
        wx.navigateTo({
            url: `../../disclaimer/disclaimer`
        })
    },
    sureRegister () {
        let inputNumberValue = this.data.inputNumberValue
        let inputPasswordValue = this.data.inputPasswordValue
        state.set({
            bindPhoneNumber: inputNumberValue,
            bindPhonePassword: inputPasswordValue
        })
        if (inputNumberValue.length < 11 || !/^1[3|4|5|7|8][0-9]{9}$/.test(inputNumberValue)) {
            wx.showModal({
                title: '提示',
                content: '请输入正确的手机号'
            })
            return
        } else if (!/^[0-9a-zA-Z]{6,12}$/.test(inputPasswordValue) ) {
            wx.showModal({
                title: '提示',
                content: '您输入的密码格式错误，密码应由6-12位英文和数字组成，请修正！'
            })
        } else {
            http(wx.request)({
                url: `${config.oauth}/api/v4/auth/sms`,
                data: {
                    tel_code: 86,
                    phone: inputNumberValue,
                    process: 'sns_signup'
                }
            })
            wx.redirectTo({
                url: '../step03/step03'
            })
        }
    }
})
