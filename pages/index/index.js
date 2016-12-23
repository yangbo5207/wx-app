import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'
import { getData, navigate } from '../../components/pullDownRefresh/pullDownRefresh'

const app = getApp()

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0
    },
    onLoad () {
        app.login().then(() => {
            this.getRecommendList(true)
            Object.assign(this, navigate)
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
        }).catch( () => {
            http(wx.showModal)({
                title: "提示",
                content: "好像出了点小问题，你可以尝试重新加载",
                confirmText: "重新加载"
            })
            .then(res => {
                if(res.confirm) {
                    this.onLoad()
                }
            })
        })

        http(wx.getSystemInfo)()
        .then( res => {
            this.setData({
                windowWidth: res.windowWidth,
                windowHeight: res.windowHeight
            })
        })
    },
    onPullDownRefresh () {
        this.getRecommendList(true)
    },
    getRecommendList (boolean) {
        const authorization = state.get('authorization')
        const _streamings = `${config.communityDomainDev}/v5/streamings`
        const pageSize = 10
        if (boolean) {
            return getData(this, {
                url: _streamings,
                data: {
                    pageCount: 1,
                    pageSize: pageSize
                },
                header: {
                    'Authorization': authorization
                }
            }, true)
        }
        return getData (this, {
            url: _streamings,
            data: {
                pageCount: this.data.pageCount + 1,
                pageSize: pageSize
            },
            header: {
                'Authorization': authorization
            }
        })
    },
    // 下拉加载更多
    upLoad () {
        this.data.enablePullDownRefresh && this.getRecommendList()
    }
})
