import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'
import { getData, navigate } from '../../components/pullDownRefresh/pullDownRefresh'

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0
    },
    onLoad () {
        this.getFeeds(true)
        Object.assign(this, navigate)
        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                windowWidth: result.windowWidth,
                windowHeight: result.windowHeight
            })
        })
    },
    onPullDownRefresh() {
        this.getFeeds(true)
    },
    upLoad() {
        this.data.enablePullDownRefresh && this.getFeeds()
    },
    getFeeds (boolean) {
        const authorization = state.get('authorization')
        const _favorites = `${config.communityDomainDev}/v5/user/favorites`
        const pageSize = 10
        if (boolean) {
            return getData(this, {
                url: _favorites,
                data: {
                    pageSize: pageSize,
                    pageCount: 1,
                    type: -1
                },
                header: { 'Authorization': authorization }
            }, true)
        }
        return getData(this, {
            url: _favorites,
            data: {
                pageSize: pageSize,
                pageCount: this.data.pageCount + 1,
                type: -1
            },
            header: { 'Authorization': authorization }
        })
    }
})
