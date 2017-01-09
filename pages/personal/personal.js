import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

Page({
    data: {
        nickname: '',
        isBindPhone: 0
    },
    onLoad () {
        this.setData({
            nickname: state.get('author').name,
            isBindPhone: state.get('isBindPhone')
        })
    },
    onShow () {
        this.onLoad()
    },
    navToNickname () {
        if (!state.get('isBindPhone')) {
            return wx.navigateTo({
                url: '../bindphone/step01/step01'
            })
        }
        wx.navigateTo({
            url: '../nickname/nickname'
        })
    },
    navToBindPhone () {
        wx.navigateTo({
            url: '../bindphone/step01/step01'
        })
    },
    navToCollect () {
        wx.navigateTo({
            url: '../collect/collect'
        })
    }
})
