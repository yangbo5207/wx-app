import config from './utils/config'
import state from './utils/state'

App({
    onLaunch: function () {
        // 正确的登录应该是将code传给服务端并获取返回结果，这里暂时使用这种方式模拟
        wx.request({
            url: `${config.loginDomainDev}/auth/authorize`,
            method: 'POST',
            data: {
                grant_type: 'password',
                username: '14900000086',
                password: 'qqqqq1'
            },
            success (result) {
                const authorization = `${result.data.data.token_type} ${result.data.data.access_token}`
                state.set('authorization', authorization)
            }
        })
    }
})