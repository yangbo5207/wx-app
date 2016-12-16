import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

Page({
    data: {
        currentTab: 0,
        recommendList: []
    },
    onLoad: function () {
        const _this = this
        const authorization = state.get('authorization')
        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/user/favorites`,
            header: { Authorization: authorization },
            data: {
                type: -1,
                pageCount: 1,
                pageSize: 20
            }
        })
        .then( result => {
            console.log(result)
            _this.setData({
                recommendList: result.data.data
            })
        })

        promise(wx.getSystemInfo)()
        .then( res => {
            _this.setData({
                windowWidth: res.windowWidth,
                windowHeight: res.windowHeight
            })
        })
    },
    bindChange: function (e) {
        this.setData({
            currentTab: e.detail.current
        })
    },
    switchNav: function (e) {
        let self = this

        if(this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            self.setData({
                currentTab: e.target.dataset.current
            })
        }
    }
}) 
