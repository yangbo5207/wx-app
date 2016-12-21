import config from '../../utils/config'
import state from '../../utils/state'
import { promise } from '../../utils/utils'

Page({
    data: {
        nickname: '',
        inputContent: ''
    },
    onLoad () {
        let author = state.get('author')
        this.setData({
            nickname: author.name
        })
    },
    input (event) {
        this.setData({
            inputContent: event.detail.value
        })
    },
    saveNickname () {
        const authorization = state.get('authorization')

        if(this.data.inputContent == '') {
            wx.showModal({
                title: '提示',
                content: '请输入您要修改的名称'
            })

            return;
        }

        promise(wx.request)({
            url: `${config.communityDomainDev}/v5/user`,
            header: {
                Authorization: authorization,
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            method: 'PUT',
            data: {
                name: this.data.inputContent
            }
        })
        .then( result => {
            const _name = result.data.name
            this.setData({
                nickname: _name
            })
            state.set({
                author: {
                    name: _name
                }
            })
            wx.showToast({
                title: `昵称已经修改为${_name}`,
                icon: 'success',
                duration: 1000
            })
            setTimeout( () => {
                wx.navigateBack({
                    delta: 1
                })
            }, 1000)

        })
        .catch( result => {
            wx.showModal({
                title: '提示',
                content: result.message
            })
        })
    }
})
