import { http } from '../../../utils/utils'
import state from '../../../utils/state'

Page({
    data: {},
    onLoad () {

    },
    testBack () {
        wx.navigateTo({
            url: state.get('sourcePage')
        })
    }
})
