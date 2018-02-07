import config from './utils/config'
import state from './utils/state'
import Promise from './utils/promise'
import { wxLogin, wxGetUserInfo, getUser, signin, actions, streamings } from './utils/request';
import regeneratorRuntime from './libs/regenerator-runtime'; // support use async/await
import { run } from './utils/http';

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

    async reLogin() {
        try {
            const loginInfo = await run(wx.login)()

            // wx login information
            const wxUserInfo = await run(wx.getUserInfo)()
            state.set({
                wxUserInfo: loginInfo.userInfo
            })

            // const login = await signin(tigerUserInfo.data.code) // 授权失败
            state.set({
                authorization: `Bearer zLpDnG0204FAlVmUY3FMxRpPJxUVIS`
            })

            // actions origin
            const _actions = await actions();
            state.set({ 'actions': _actions.data })

            const tigerUserInfo = await getUser()
            state.set({
                'author': tigerUserInfo.data,
                'sourceNickname': tigerUserInfo.data.name
            })

            return tigerUserInfo.data;
        } catch (err) { return err }
    }
})
