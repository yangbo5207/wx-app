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
    navToDisclaimer () {
        wx.navigateTo({
            url: `../../disclaimer/disclaimer`
        })
    },
    switchEncryption () {
        this.setData({
            isEncryption: !this.data.isEncryption
        })
    },
    login () {
        let inputNumberValue = this.data.inputNumberValue
        let inputPasswordValue = this.data.inputPasswordValue
        const wxappid = state.get('wxappid')
        state.set({
            bindPhoneNumber: inputNumberValue,
            bindPhonePassword: inputPasswordValue
        })
        if (inputNumberValue.length < 11 || !/^1[3|4|5|7|8][0-9]{9}$/.test(inputNumberValue)) {
            return wx.showModal({
                title: '提示',
                content: '请输入正确的手机号'
            })
        }
        http(wx.showModal)({
            title: '数据合并',
            content: '本次绑定之后，将只保留您的手机账户数据，如有疑问请联系客服'
        }).then((result) => {
            if (result.confirm) {
                wx.showToast({ title: '加载中...', icon: 'loading', duration: 10000 })
                return http(wx.request)({
                    url: `${config.oauth}/api/v4/auth/sns/binduser/wxapp`,
                    method: 'PUT',
                    data: {
                        username: inputNumberValue,
                        login_password: inputPasswordValue,
                        openid: wxappid
                    },
                    header: { 'Authorization': state.get('authorization') }
                }).then( result => {
                    wx.hideToast()
                    if (!result.is_succ) {
                        return wx.showModal({
                            title: '提示',
                            content: result.data.error_description
                        })
                    }
                    wx.showToast({
                        title: '绑定成功！',
                        icon: 'success'
                    })
                    const authorization = `Bearer ${result.data.access_token}`
                    state.set({
                        'authorization': authorization,
                        'isBindPhone': true,
                        'wxappid': result.data.wxappid
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
                            changeNickName(`${state.get('author').name}0`)
                        })
                    }

                    setTimeout(() => { wx.navigateBack() }, 1500)
                }, () => {
                    wx.hideToast()
                    wx.showModal({
                        title: '提示',
                        content: '接口请求失败，请重试'
                    })
                // 更新缓存数据
                }).then(() => {
                    return http(wx.request)({
                        url: `${config.community}/v5/user/actions/key`,
                        header: { 'Authorization': state.get('authorization') }
                    })
                }).then(result => {
                    state.set({ 'actions': result.data })
                })
            }
        })
    }
})
