import { http } from '../../../utils/utils'
import state from '../../../utils/state'
import config from '../../../utils/config'

Page({
    data: {
        isEncryption: 1,
        inputValue: ''
    },
    onLoad () {
        this.setData({
            inputValue: state.get('bindingPhone')
        })
        
    },
    switchEncryption () {
        this.setData({
            isEncryption: !this.data.isEncryption
        })
    }
})
