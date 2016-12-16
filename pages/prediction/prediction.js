import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../wxParse/wxParse'
import { promise } from '../../utils/utils'

Page({
    data: {
        currentTab: 0
    },
    onLoad: function () {
        const postid = 1
        const type = 6
        const authorization = state.get('authorization')

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/forecast/${postid}`,
            header: { Authorization: authorization },
            data: {
                wx: 1,
                __fieldtype: 'show'
            }
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
