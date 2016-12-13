import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../wxParse/wxParse'
import { promise } from '../../utils/utils'

Page({
    data: {
        post: {}
    },
    onLoad: function () {
        let self = this,
            postid = state.get('postid'),
            authorization = state.get('authorization'),
            postURL = `${config.communityDomainDev}/v5/tweet/${postid}`;

        promise(wx.request)({
            url: postURL,
            header: { 'Authorization': authorization }
        })
        .then(res => {
            const article = res.data.data.content
            promise(wx.getSystemInfo)()
            .then(systemInfo => {
                WxParse.wxParse('article', 'html', article, self, 0.04*systemInfo.windowWidth);
            })
            self.setData({
                post: res.data.data
            })
        })
        .catch(() => {
            wx.showModal({
                title: '提示',
                content: '与服务器断开连接，请检查是否为网络问题'
            })
        })
    }
})