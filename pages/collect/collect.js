import regeneratorRuntime from '../../libs/regenerator-runtime'; // support use async/await
import { assign, formatTime } from '../../utils/utils'
import { navigate } from '../../components/upLoadMore/upLoadMore'
import { favorite } from '../../utils/request';
import { run } from '../../utils/http';

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
    async onLoad () {
        const res = await run(wx.getSystemInfo)();
        this.setData({
            windowWidth: res.windowWidth,
            windowHeight: res.windowHeight
        })
        this.getFeeds(true)
        assign(this, navigate)
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

        let list = resp.data.map(item => {
            item.gmtCreate = formatTime(item.gmtCreate)
            return item
        })

        this.setData({
            dataList: isFirst ? list : this.data.dataList.concat(list)
        })
    }
})
