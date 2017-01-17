import config from './utils/config'
import state from './utils/state'
import { http } from './utils/utils'
import Promise from './utils/promise'

// 线上
// appid: 'wx87ef8d5ebed00eed'
// secret: '5746108f85fe52594b1639bbd9d5abe9'

App({
    onLaunch () {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })
    },
    login () {
        return state.get('authorization') ? Promise.resolve(state.get('authorization')) : this.reLogin()
    },
    reLogin () {
        return http(wx.login)()
        .then(result => {
            wx.getUserInfo({
                success: function (res) {
                    state.set({
                        wxUserInfo: res.userInfo
                    })
                }
            })
            return result.code
        })
        .then(code => {
            return http(wx.request)({
                url: `${config.oauth}/api/v4/auth/sns/signin/wxapp`,
                method: 'POST',
                data: {
                    access_token: code,
                    appVer: '1.0.0',
                    platform: 'wxapp'
                }
            }).then( result => {
                const authorization = `Bearer ${result.data.access_token}`
                state.set({
                    'authorization': authorization,
                    'isBindPhone': result.data.new_status.sns_status.wxapp_binding,
                    // wxappid 是后端返回的openid, 所有需要openid的值都需要传入此参数
                    'wxappid': result.data.wxappid
                })
                return authorization;
            })
        }).then(result => {
            return http(wx.request)({
                url: `${config.community}/v5/user/actions/key`,
                header: { 'Authorization': result }
            }).then(res => {
                state.set({ 'actions': res.data })
                return result
            })
        }).then(result => {
            return http(wx.request)({
                url: `${config.community}/v5/user`,
                header: { 'Authorization': state.get('authorization') }
            }).then(res => {
                state.set({ 
                    'author': res.data,
                    'sourceNickname': res.data.name 
                })
                console.log('source state:', state.getStates())
                return result
            })
        }).catch(() => {
            http(wx.showModal)({
                title: "提示",
                content: "登录时出了点小问题，你可以尝试重新登录",
                confirmText: "重新登录"
            }).then(res => {
                if(res.confirm) {
                    this.reLogin()
                }
            })
        })
    }
})
