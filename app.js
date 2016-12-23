import config from './utils/config'
import state from './utils/state'
import { http } from './utils/utils'

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
        return http(wx.login)()
        .then(result => {
            return result.code
        }).then(code => {
            return http(wx.request)({
                url: `${config.oauth}/api/v4/auth/sns/signin/wxapp`,
                method: 'POST',
                data: {
                    access_token: code,
                    appVer: '1.0.0',
                    platform: 'wxapp'
                }
            })
        }).then( result => {
            const authorization = `Bearer ${result.data.access_token}`
            state.set({
                'authorization': authorization,
                'isBindPhone': result.data.new_status.sns_status.wxapp_binding,
                // wxappid 是后端返回的openid, 所有需要openid的值都需要传入此参数
                'wxappid': result.data.wxappid
            })

            // 解除绑定
            // http(wx.request)({
            //     url: `${config.oauth}/api/v4/auth/sns/unbind`,
            //     method: 'PUT',
            //     data: {
            //         oauth_os: 'wxapp'
            //     },
            //     header: { 'Authorization': state.get('authorization') }
            // }).then(result => {
            //     console.log(result)
            // })
        })
    }
})
