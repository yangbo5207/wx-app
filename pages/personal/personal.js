import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

Page({
    data: {
        nickname: ''
    },
    onLoad () {
        this.setData({
            nickname: state.get('author').name
        })
    },
    onShow () {
        this.onLoad()
    },
    navToNickname () {
        wx.navigateTo({
            url: '../nickname/nickname'
        })
    },
})
