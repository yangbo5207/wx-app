import config from './utils/config'
import state from './utils/state'
import { promise } from './utils/utils'

App({
    onLaunch () {
        const _this = this
        this.login().then(() => {
            return promise(wx.request)({
                url: `${config.communityDomainDev}/v5/user/actions/key`,
                header: { 'Authorization': state.get('authorization') }
            })
            .then(result => {
                state.set({ 'actions': result.data.data })
            })
            .then( () => {
                return promise(wx.request)({
                    url: `${config.communityDomainDev}/v5/user`,
                    header: { 'Authorization': state.get('authorization') }
                })
                .then(request => {
                    state.set({ 'author': request.data.data })
                    console.log('app 初始化完成')
                })
            })
        })
        .catch( () => {
            promise(wx.showModal)({
                title: "提示",
                content: "好像除了点小问题，你可以尝试重新加载",
                confirmText: "重新加载"
            })
            .then(res => {
                if(res.confirm) {
                    _this.onLaunch()
                }
            })
        })
    },
    login () {
        return promise(wx.request)({
            url: `${config.loginDomainDev}/auth/authorize`,
            method: 'POST',
            data: { 
                grant_type: 'password',
                username: '14900000086',
                password: 'qqqqq1'
            }
        })
        .then(result => {
            console.log(result)
            const authorization = `${result.data.data.token_type} ${result.data.data.access_token}`
            state.set({ 'authorization': authorization })
        })

        // 后续可能被采用的代码片段
        // let openid, token;

        // promise(wx.login)()
        // .then(result => {
        //     return result.code
        // })
        // .then(code => {
        //     // 通过code获取openid
        //     return promise(wx.request)({
        //         url: 'https://api.weixin.qq.com/sns/jscode2session',
        //         data: {
        //             appid: 'wx87ef8d5ebed00eed',
        //             secret: '5746108f85fe52594b1639bbd9d5abe9',
        //             js_code: code,
        //             grant_type: 'authorization_code'
        //         }
        //     })
        // })
        // .then(result => {
        //     openid = result.data.openid
        // })
        // .then(() => {
        //     // 通过appid与appSecret获取access_token
        //     return promise(wx.request)({
        //         url: 'https://api.weixin.qq.com/cgi-bin/token',
        //         data: {
        //             appid: 'wx87ef8d5ebed00eed', 
        //             secret: '5746108f85fe52594b1639bbd9d5abe9',
        //             grant_type: 'client_credential'
        //         },
        //     })
        // })
        // .then(result => {
        //     token = result.data.access_token
        // })
        // .then(() => {
        //     return promise(wx.request)({
        //         url: `${config.loginDomainDev}/api/v4/auth/sns/signin/wechat`,
        //         method: 'POST',
        //         data: {
        //             access_token: token,
        //             openid: openid
        //         }
        //     })
        // })
        // .then(result => {
        //     console.log(result)
        // })
    }
})