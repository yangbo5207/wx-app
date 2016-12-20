import config from './utils/config'
import state from './utils/state'
import { http } from './utils/utils'

// appid: 'wx87ef8d5ebed00eed'
// secret: '5746108f85fe52594b1639bbd9d5abe9'

App({
    onLaunch () {
        this.login().then(() => {
            return http(wx.request)({
                url: `${config.communityDomainDev}/v5/user/actions/key`,
                header: { 'Authorization': state.get('authorization') }
            })
            .then(result => {
                console.log('get key',result)
                state.set({ 'actions': result.data })
            })
            .then( () => {
                return http(wx.request)({
                    url: `${config.communityDomainDev}/v5/user`,
                    header: { 'Authorization': state.get('authorization') }
                })
                .then(request => {
                    state.set({ 'author': request.data })
                    console.log('app 初始化完成')
                })
            })
        })
        .catch( () => {
            http(wx.showModal)({
                title: "提示",
                content: "好像出了点小问题，你可以尝试重新加载",
                confirmText: "重新加载"
            })
            .then(res => {
                if(res.confirm) {
                    this.onLaunch()
                }
            })
        })
    },
    login () {
        // return http(wx.request)({
        //     url: `${config.loginDomainDev}/auth/authorize`,
        //     method: 'POST',
        //     data: {
        //         grant_type: 'password',
        //         username: '14900000086',
        //         password: 'qqqqq1'
        //     }
        // })
        // .then(result => {
        //     const authorization = `${result.data.token_type} ${result.data.access_token}`
        //     state.set({ 'authorization': authorization })
        // })

        return http(wx.login)()
        .then(result => {
            console.log('app code:', result)
            return result.code
        })
        .then(code => {
            return http(wx.request)({
                url: `${config.loginDomain}/api/v4/auth/sns/signin/wxapp`,
                method: 'POST',
                data: {
                    access_token: code,
                    appVer: '1.0.0',
                    platform: 'wxapp'
                }
            }).then( result => {
                console.log('login result', result)
                const authorization = `Bearer ${result.data.access_token}`
                state.set({
                    'authorization': authorization,
                    'isBindPhone': result.data.new_status.sns_status.wxapp_binding
                })
                console.log(state.getStates())
            })
        })
    }
})
