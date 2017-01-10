import { http } from '../../../utils/utils'
import state from '../../../utils/state'
import config from '../../../utils/config'

Page({
    data: {
        phoneNumber: '',
        countDown: 60,
        isCountdownEnd: 0,
        isError: 0,
        verifyCode: '',
        errorMessage: ''
    },
    onLoad () {
        setTimeout( () => {
            this.countDown()
        }, 1000)
        this.setData({
            phoneNumber: state.get('bindPhoneNumber')
        })
    },
    countDown () {
        let timer = null
        timer = setTimeout( () => {
            this.setData({
                countDown: this.data.countDown - 1
            })

            if (this.data.countDown > 0) {
                this.countDown()
            } else {
                this.setData({
                    isCountdownEnd: 1
                })
            }
        }, 1000)
    },
    inputCode (event) {
        this.setData({
            verifyCode: event.detail.value
        })
    },
    sendVerificationCode () {
        wx.showToast({
            title: 'waiting...',
            icon: 'loading',
            duration: 10000
        })

        this.setData({
            countDown: 60,
            isCountdownEnd: 0,
            isError: 0
        })
        this.countDown()

        http(wx.request)({
            url: `${config.oauth}/api/v4/auth/sms`,
            data: {
                tel_code: 86,
                phone: state.get('bindPhoneNumber'),
                process: 'sns_signup'
            }
        }).then( result => {
            wx.hideToast()
            wx.showToast({
                title: result.data.message,
                icon: 'success'
            })
        }).catch(() => {
            wx.showModal({
                title: '提示',
                content: '短信验证码发送失败，点击确认重新发送',
                success () {
                    this.sendVerificationCode()
                }
            })
        })
    },
    finishRegister () {
        const verifyCode = this.data.verifyCode
        const phone = state.get('bindPhoneNumber')
        const password = state.get('bindPhonePassword')
        const wxappid = state.get('wxappid')

        this.setData({ isError: 0 })
        wx.showToast({
            title: '加载中...',
            icon: 'loading'
        })

        if (verifyCode.length < 6) {
            wx.hideToast()
            return this.setData({
                isError: 1,
                errorMessage: '验证码不足6位，请重新输入'
            })
        }
        // ?
        http(wx.request)({
            url: `${config.oauth}/api/v4/auth/sms`,
            data: {
                tel_code: 86,
                phone: state.get('bindPhoneNumber'),
                process: 'sns_signup',
                verify_code: verifyCode
            }
        }).then(result => {
            // 三方手机注册
            return http(wx.request)({
                url: `${config.oauth}/api/v4/auth/sns/signup/wxapp`,
                method: 'PUT',
                data: {
                    phone: phone,
                    login_password: password,
                    verify_code: verifyCode,
                    openid: wxappid
                }
            })
        }, () => {
            wx.hideToast()
            this.setData({
                isError: 1,
                errorMessage: '验证码错误，请重新输入'
            })
        }).then(result => {
            wx.hideToast()
            if (!result.is_succ) {
                return this.setData({
                    isError: 1,
                    errorMessage: result.data.error_description
                })
            }
            wx.showToast({
                title: '注册成功',
                icon: 'success'
            })

            // 从返回值中保存access_token，并跳转到来时的页面
            const authorization = `Bearer ${result.data.access_token}`
            state.set({
                'authorization': authorization,
                'isBindPhone': result.data.new_status.sns_status.wxapp_binding,
            })

            // 注册成功时设置用户的默认昵称为微信昵称
            changeNickName(state.get('wxUserInfo').nickName)

            let changeCount = 0;
            function changeNickName (nickname) {
                changeCount ++;
                if (changeCount > 2) {
                    return
                }
                http(wx.request)({
                    url: `${config.community}/v5/user`,
                    header: {
                        Authorization: authorization,
                        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    method: 'PUT',
                    data: {
                        name: nickname
                    }
                }).then(result => {
                    const _name = result.data.name
                    state.set({
                        author: result.data
                    })
                }).catch(result => {
                    changeNickName(state.get('author').name)
                })
            }

            setTimeout(() => { wx.navigateBack() }, 1500)
        }, () => {
            wx.hideToast();
            this.setData({
                isError: 1,
                errorMessage: '注册接口请求失败，请重试'
            })
        })

    }
})
