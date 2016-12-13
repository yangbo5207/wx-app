import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../wxParse/wxParse'

Page({
    data: {
        post: {}
    },
    onLoad: function () {
        let self = this,
            postid = state.get('postid'),
            authorization = state.get('authorization'),
            postURL = `${config.communityDomainDev}/v5/tweet/${postid}`;

        wx.request({
            url: postURL,
            header: { 'Authorization': authorization },
            success (res) {
                let article = res.data.data.content
                wx.getSystemInfo({
                    success: systemInfo => {
                        WxParse.wxParse('article', 'html', article, self, 0.04*systemInfo.windowWidth);
                    }
                })
                self.setData({
                    post: res.data.data
                })
            },
            fail () {
                console.log('xxxx')
                wx.showModal({
                    title: '提示',
                    content: '与服务器断开连接，请检查是否为网络问题'
                })
            }
        })
    }
})