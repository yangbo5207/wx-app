import regeneratorRuntime from '../../libs/regenerator-runtime'; // support use async/await
import config from '../../utils/config'
import state from '../../utils/state'
import { http, assign, formatTime } from '../../utils/utils'
import { getData, navigate } from '../../components/upLoadMore/upLoadMore'
import { favorite } from '../../utils/request';

Page({
    data: {
        windowWidth: 0,
        windowHeight: 0,
        isBottomEnd: 0,
        isData: 1,
        isBottomLoading: 0,
        enableUpLoadMore: 1,
        pageCount: 1
    },
    onLoad () {
        this.getFeeds(true)
        assign(this, navigate)
        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                windowWidth: result.windowWidth,
                windowHeight: result.windowHeight
            })
        })
    },

    onPullDownRefresh() {
        this.onLoad()
    },

    onReachBottom() {
        this.data.enableUpLoadMore && this.getFeeds()
    },

    async getFeeds (isFirst) {
        let curPageCount = this.data.pageCount;
        if (!isFirst) {
            if (this.data.enableUpLoadMore) {
                return;
            }
            curPageCount += 1;
            this.setData({
                isBottomLoading: 1,
                pageCount: curPageCount
            })
        }

        const resp = await favorite(curPageCount);

        let list = resp.data.data.map(item => {
            item.gmtCreate = formatTime(item.gmtCreate)
            return item
        })

        this.setData({
            dataList: isFirst ? list : this.data.dataList.concat(list)
        })
    }
})
