import regeneratorRuntime from '../../libs/regenerator-runtime'; // support use async/await
import { assign } from '../../utils/utils'
import { getData, navigate } from '../../components/upLoadMore/upLoadMore'
import { streamings } from '../../utils/request';

const app = getApp()

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
        try {
            await app.login()
            const res = this.getRecommendList(true);
            wx.stopPullDownRefresh()
            assign(this, navigate);

            const info = wx.getSystemInfoSync;
            this.setData({
                windowWidth: info.windowWidth,
                windowHeight: info.windowHeight
            })
        } catch(err) {
            wx.showModal({
                title: 'Error Message',
                content: err.message,
                confirmText: 'reload',
                success: () => this.onLoad()
            })
        }
    },
    async getRecommendList(isFirst) {
        let curPageCount = this.data.pageCount
        if (!isFirst) {
            if (this.data.enableUpLoadMore) {
                return
            }
            curPageCount += 1
            this.setData({
                isBottomLoading: 1,
                pageCount: curPageCount
            })
        }

        const resp = await streamings(curPageCount)

        let list = resp.data.map(item => {
            item.gmtCreate = formatTime(item.gmtCreate)
            return item
        })

        this.setData({
            dataList: isFirst ? list : this.data.dataList.concat(list)
        })
    },

    onPullDownRefresh () {
        this.onLoad()
    },

    // 加载更多
    onReachBottom () {
        this.data.enableUpLoadMore && this.getRecommendList()
    },

    onShareAppMessage (option) {
        const postTitle = '今日看点'
        const path = this.__route__

        return {
            title: postTitle,
            path: path
        }
    }
})
