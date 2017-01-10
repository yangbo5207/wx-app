import config from '../../utils/config'
import state from '../../utils/state'
import { http } from '../../utils/utils'

Page({
    data: {
        nickname: '',
        isBindPhone: 0
    },
    onLoad () {
        const author = state.get('author')
        const nickname = author.status == 1 ? state.get('wxUserInfo').nickName : author.name
        this.setData({
            nicknameStatus: author.status,
            nickname: nickname,
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
    },
    unBinding () {
        http(wx.request)({
            url: `${config.oauth}/api/v4/auth/sns/unbind`,
            header: {
                Authorization: state.get('authorization'),
            },
            method: 'PUT',
            data: {
                oauth_os: 'wxapp'
            }
        })
    }
})
