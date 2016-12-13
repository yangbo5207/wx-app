import config from './utils/config'
import state from './utils/state'
import { promise } from './utils/utils'

App({
    onLaunch: function () {
        // 正确的登录应该是将code传给服务端并获取返回结果，这里暂时使用这种方式模拟
        promise(wx.request)({
            url: `${config.loginDomainDev}/auth/authorize`,
            method: 'POST',
            data: { 
                grant_type: 'password',
                username: '14900000086',
                password: 'qqqqq1'
            }
        })
        .then(result => {
            const authorization = `${result.data.data.token_type} ${result.data.data.access_token}`
            state.set('authorization', authorization)
        })

        let openid, token;

        promise(wx.login)()
        .then(result => {
            return result.code
        })
        .then(code => {
            // 通过code获取openid
            return promise(wx.request)({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                data: {
                    appid: 'wx87ef8d5ebed00eed',
                    secret: '5746108f85fe52594b1639bbd9d5abe9',
                    js_code: code,
                    grant_type: 'authorization_code'
                }
            })
        })
        .then(result => {
            openid = result.data.openid
        })
        .then(() => {
            // 通过appid与appSecret获取access_token
            return promise(wx.request)({
                url: 'https://api.weixin.qq.com/cgi-bin/token',
                data: {
                    appid: 'wx87ef8d5ebed00eed', 
                    secret: '5746108f85fe52594b1639bbd9d5abe9',
                    grant_type: 'client_credential'
                },
            })
        })
        .then(result => {
            token = result.data.access_token
        })
        .then(() => {
            return promise(wx.request)({
                url: `${config.loginDomainDev}/api/v4/auth/sns/signin/wechat`,
                method: 'POST',
                data: {
                    access_token: token,
                    openid: openid
                }
            })
        })
        .then(result => {
            console.log(result)
        })
    }
})