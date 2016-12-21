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
        if (!/^[0-9a-zA-Z]{6,12}$/.test(inputPasswordValue)) {
            return wx.showModal({
                title: '提示',
                content: '您输入的密码格式错误，密码应由6-12位英文和数字组成，请修正！'
            })
        }
        http(wx.showModal)({
            title: '数据合并',
            content: '本次绑定之后，将只保留您的手机账户数据，如有疑问请联系客服'
        }).then( () => {
            wx.showToast({ title: '加载中...', icon: 'loading', duration: 10000 })
            return http(wx.request)({
                url: `${config.loginDomain}/api/v4/auth/sns/binduser/wxapp`,
                method: 'PUT',
                data: {
                    username: inputNumberValue,
                    login_password: inputPasswordValue,
                    openid: wxappid
                },
                header: { 'Authorization': state.get('authorization') }
            })
        }).then( result => {
            wx.hideToast()
            if (result.is_succ) {
                const authorization = `Bearer ${result.data.access_token}`
                state.set({
                    'authorization': authorization,
                    'isBindPhone': true,
                    // wxappid 是后端返回的openid, 所有需要openid的值都需要传入此参数
                    'wxappid': result.data.wxappid
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: result.data.error_description
                })
            }
        }, () => {
            wx.hideToast()
            wx.showModal({
                title: '提示',
                content: '接口请求失败，请重试'
            })
        // 更新缓存数据
        }).then(() => {
            return http(wx.request)({
                url: `${config.communityDomainDev}/v5/user/actions/key`,
                header: { 'Authorization': state.get('authorization') }
            })
        }).then(result => {
            state.set({ 'actions': result.data })
        }).then(() => {
            return http(wx.request)({
                url: `${config.communityDomainDev}/v5/user`,
                header: { 'Authorization': state.get('authorization') }
            })
        }).then(request => {
            state.set({ 'author': request.data })
            console.log('app 初始化完成', state.getStates())
        }).then(() => {
            wx.navigateBack()
        })
    }
})
