import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../components/wxParse/wxParse'
import { http, formatTime, decimal, symbolType, fixZero, assign } from '../../utils/utils'
import actionsBar from '../../components/actionsBar/actionsBar'

const app = getApp()

Page({
    data: {
        currentTab: 0,
        content: '',
        tabItemWidth: 25,
        swiperHeight: 0,
        scrollViewHeight: 0
    },
    onLoad: function (option) {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })

        let authorization = state.get('authorization')
        const postid = option.id
        const type = option.type
        state.set({
            postid: postid,
            type: type
        })
        assign(this, actionsBar.optionFn)

        app.login().then(result => {
            authorization = result
            state.set({ authorization: authorization })
            this.initialAction()
            return http(wx.request)({
                url: `${config.community}/v5/forecast/${postid}`,
                header: { Authorization: authorization },
                data: { wx: 1, __fieldtype: 'show' }
            }).then(result => {
                wx.hideToast();
                return this.render(result)
            }).then( result => {
                const symbol = result.data.symbol
                this.setData({
                    symbolType: symbolType(symbol)
                })
                this.setDetail(symbol)
                // this.setKLine(symbol)
                this.setFiveTrendLine(symbol)
            }).catch(result => {
                wx.hideToast()
                if (result.status) {
                    http(wx.showModal)({
                        title: "提示",
                        content: "错误码:" + result.status,
                        confirmText: "重新加载"
                    }).then(res => {
                        if(res.confirm) { this.onLoad() }
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '网络好像出了点问题'
                    })
                }
            })
        })

        state.bind('changeCommentCount', this.changeCommentCount, this)

        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                swiperHeight: result.windowHeight - 50,
                scrollViewHeight: result.windowHeight - 100
            })
        })

    },
    render(result) {
        let replyArr = []
        result.data.gmtCreate = formatTime(result.data.gmtCreate)
        result.data.bodies.push({type: 4})
        result.data.bodies = result.data.bodies.map(item => {
            replyArr.push(item.html)
            item.isParse = 0
            switch (item.type) {
                case 1:
                    item.typeName = '消息面'
                    break;
                case 2:
                    item.typeName = '基本面'
                    break;
                case 3:
                    item.typeName = '数据面'
                    break;
                case 4:
                    item.typeName = '盘面情况'
                    break;
            }
            return item
        })
        replyArr.map((item, i) => {
            WxParse.wxParse('reply' + i, 'html', item, this)
            if (i == replyArr.length - 1) {
                WxParse.wxParseTemArray("replyTemArray", 'reply', replyArr.length, this)
            }
        })
        this.setData({
            content: result.data,
            tabItemWidth: 100/result.data.bodies.length,
            commentSize: result.data.commentSize,
            likeSize: result.data.likeSize
        })
        return result
    },
    setDetail(symbol) {
        const authorization = state.get('authorization')
        let _url = ''
        if (this.data.symbolType == 'US') {
            _url = `${config.quotation}/stock_info/detail`
        } else if (this.data.symbolType == 'HK') {
            _url = `${config.quotation}/hkstock/stock_info/detail`
        }
        http(wx.request)({
            url: _url,
            method: 'POST',
            data: {
                items: [{'symbol': symbol}]
            },
            header: { 'Authorization': authorization }
        }).then(result => {
            let detail = result.items[0]
            let changeRate = decimal((detail.latestPrice - detail.preClose) / detail.preClose * 100, 2)
            detail.changeRate = (changeRate >= 0) ? `+${changeRate}%` : `${changeRate}%`
            detail._changeRate = changeRate
            detail.change = changeRate >= 0 ? `+${detail.change}` : detail.change // 根据该值的正负来判断颜色的显示
            detail.changeHandRate = detail.floatShares > 0 ? `${decimal(detail.volume / detail.floatShares * 100, 2)}%` : '0%'
            detail.totleValue = `${decimal(detail.latestPrice * detail.shares / 100000000, 0)}亿`
            detail.gain = decimal(detail.latestPrice / detail.eps, 2)
            detail.turnover =  `${decimal(detail.volume / 10000, 0)}万`
            this.setData({
                detail: detail
            })
        })
    },
    setFiveTrendLine(symbol) {
        const authorization = state.get('authorization')
        let _url = ''
        this.data.symbolType == 'US' && (_url = `${config.quotation}/stock_info/time_trend/5day/${symbol}`)
        this.data.symbolType == 'HK' && (_url = `${config.quotation}/hkstock/stock_info/time_trend/5day/${symbol}`)
        http(wx.request)({
            url: _url,
            header: { 'Authorization': authorization }
        }).then(result => {
            this.render5DayTrend(result);
        })
    },
    render5DayTrend (result) {
        let windowWidth = 0
        http(wx.getSystemInfo)()
        .then(res => {
            windowWidth = res.windowWidth
            let average = windowWidth / 495
            let items = []
            result.items.map(item => {
                items.push(...item.items);
            })
            let maxVolume = 0
            let minVolume = 0
            let fullVolume = 0
            let maxAvgPrice = 0
            let minAvgPrice = 0
            let fullAvgPrice = 0
            let maxPrice = 0
            let minPrice = 0
            let fullPrice = 0
            items.map((item, i) => {
                if (i == 0) {
                    maxVolume = minVolume = item.volume
                    maxAvgPrice = minAvgPrice = item.avgPrice
                    maxPrice = minPrice = item.price
                }
                item.volume > maxVolume && (maxVolume = item.volume)
                item.volume < minVolume && (minVolume = item.volume)
                item.avgPrice > maxAvgPrice && (maxAvgPrice = item.avgPrice)
                item.avgPrice < minAvgPrice && (minAvgPrice = item.avgPrice)
                item.price > maxPrice && (maxPrice = item.price)
                item.price < minPrice && (minPrice = item.price)
            })
            let max = Math.max(maxAvgPrice, maxPrice, result.preClose)
            let min = Math.min(minAvgPrice, minPrice, result.preClose)
            let full = (max - min) / 0.8
            fullVolume = (maxVolume - minVolume) / 0.8

            let dateArray = []

            const ctx = wx.createCanvasContext('stage')

            // 上下分割线，中间显示起始时间
            ctx.beginPath()
            ctx.moveTo(0, 140)
            ctx.lineTo(windowWidth, 140)
            ctx.moveTo(0, 120)
            ctx.lineTo(windowWidth, 120)
            ctx.setStrokeStyle('#E5E5E5')
            ctx.stroke()

            // 昨日收盘价，虚线表示
            ctx.beginPath()
            let preY = 120 - (result.preClose - min) / full * 120
            let preAvg = windowWidth / 100
            for (let i = 0; i < 50; i++) {
                ctx.moveTo(2 * i * preAvg, preY)
                ctx.lineTo((2 * i + 1) * preAvg, preY)
            }
            ctx.setStrokeStyle('#999999')
            ctx.stroke()

            // 均价线
            ctx.beginPath()
            ctx.setLineCap('round')
            items.map((item, i) => {
                let avgX = average * ((1 - 0.04) / 2 + i)
                let avgY = 120 - ((item.avgPrice - min) / full) * 120
                if (i % 99 == 0) {
                    ctx.moveTo(avgX, avgY)
                }
                ctx.lineTo(avgX, avgY)
            })
            ctx.setStrokeStyle('#EB6422')
            ctx.setLineWidth(1)
            ctx.stroke()

            // 当前价线条
            ctx.beginPath()
            ctx.setLineCap('round')
            items.map((item, i) => {
                let pX = average * ((1 - 0.04) / 2 + i)
                let pY = 120 - ((item.price - min) / full) * 120
                if (i % 99 == 0) {
                    ctx.moveTo(pX, pY)
                }
                ctx.lineTo(pX, pY)
            })
            ctx.setStrokeStyle('#218DF2')
            ctx.setLineWidth(1)

            // cosnt grd = ctx.createLinearGradient(0, 0, 0, 120)
            // grd.addColorStop(0, grba(33, 141, 242, 0.3))
            // grd.addColorStop(1, grba(255, 255, 255, 0.3))
            // ctx.setFillStyle(grd)
            // ctx.fill()
            ctx.stroke()

            // 下方的成交量，用矩形表示
            items.map((item, i) => {
                let w = (average * (1 - 0.04))
                let vX = average * i
                let h = (item.volume - minVolume) / fullVolume * 60
                let vY = 200 - h
                let color = '#F20642'
                if (i > 0 && (item.price - items[i-1].price < 0)) {
                    color = '#3BD595'
                }
                ctx.setFillStyle(color)
                ctx.fillRect(vX, vY, w, h)
            })

            // 日期和分割线
            ctx.beginPath()
            ctx.setFontSize(12)
            ctx.setFillStyle('#999999')
            ctx.fillText(`${decimal(maxVolume/10000, 2)}万股`, 5, 155)
            items.map((item, i) => {
                if (i % 99 == 0) {
                    const curDay = i / 99
                    const aveDayWidth = windowWidth / 5
                    ctx.moveTo(average * i, 200)
                    ctx.lineTo(average * i, 140)
                    const date = new Date(item.time)
                    const time = `${fixZero(date.getMonth() + 1)}-${fixZero(date.getDate())}`
                    ctx.fillText(time, aveDayWidth * curDay + 20, 135)
                }
            })
            ctx.setStrokeStyle('#E5E5E5')
            ctx.stroke()

            ctx.draw()
        })
    },
    setKLine (symbol) {
        const authorization = state.get('authorization')
        let _url = ''
        if (this.data.symbolType == 'US') {
            _url = `${config.quotation}/stock_info/time_trend/day/${symbol}`
        } else if(this.data.symbolType == 'HK') {
            _url = `${config.quotation}/hkstock/stock_info/time_trend/day/${symbol}`
        }
        http(wx.request)({
            url: _url,
            header: { 'Authorization': authorization }
        }).then(result => {
            this.renderKLine(result)
        })
    },
    renderKLine (result) {
        let windowWidth = 0
        http(wx.getSystemInfo)()
        .then(res => {
            windowWidth = res.windowWidth
            let average = windowWidth / 390
            let items = []
            result.items.map(item => {
                items.push(item)
            })
            let maxVolume = 0
            let minVolume = 0
            let fullVolume = 0
            let maxAvgPrice = 0
            let minAvgPrice = 0
            let fullAvgPrice = 0
            let maxPrice = 0
            let minPrice = 0
            let fullPrice = 0
            items.map((item, i) => {
                if (i == 0) {
                    maxVolume = item.volume
                    minVolume = item.volume
                    maxAvgPrice = item.avgPrice
                    minAvgPrice = item.avgPrice
                    maxPrice = item.price
                    minPrice = item.price
                }
                item.volume > maxVolume && (maxVolume = item.volume)
                item.volume < minVolume && (minVolume = item.volume)
                item.avgPrice > maxAvgPrice && (maxAvgPrice = item.avgPrice)
                item.avgPrice < minAvgPrice && (minAvgPrice = item.avgPrice)
                item.price > maxPrice && (maxPrice = item.price)
                item.price < minPrice && (minPrice = item.price)
            })
            let max = Math.max(maxAvgPrice, maxPrice, result.preClose)
            let min = Math.min(minAvgPrice, minPrice, result.preClose)
            let full = (max - min) / 0.8

            fullVolume = (maxVolume - minVolume) / 0.8

            const ctx = wx.createCanvasContext('stage')

            // 上下分割线，中间显示起始时间
            ctx.beginPath()
            ctx.moveTo(0, 140)
            ctx.lineTo(windowWidth, 140)
            ctx.moveTo(0, 120)
            ctx.lineTo(windowWidth, 120)
            ctx.setStrokeStyle('#E5E5E5')
            ctx.stroke()

            // 昨日收盘价，虚线表示
            ctx.beginPath()
            let preY = 120 - (result.preClose - min) / full * 120
            let preAvg = windowWidth / 100
            for (let i = 0; i < 50; i++) {
                ctx.moveTo(2 * i * preAvg, preY)
                ctx.lineTo((2 * i + 1) * preAvg, preY)
            }
            ctx.setStrokeStyle('#999999')
            ctx.stroke()

            // 需要显示的文字
            ctx.setFontSize(12)
            ctx.setFillStyle('#999999')
            ctx.fillText('9:30', 5, 135)
            ctx.fillText('16:00', windowWidth - 35, 135)
            ctx.fillText(`${decimal(maxVolume/10000, 2)}万股`, 5, 155)

            // 均价线
            ctx.beginPath()
            ctx.setLineCap('round')
            items.map((item, i) => {
                let avgX = average * ((1 - 0.04) / 2 + i)
                let avgY = 120 - ((item.avgPrice - min) / full) * 120
                if (i == 0) {
                    ctx.moveTo(avgX, avgY)
                }
                ctx.lineTo(avgX, avgY)
            })
            ctx.setStrokeStyle('#218DF2')
            ctx.setLineWidth(1)
            ctx.stroke()

            // 当前价线条
            ctx.beginPath()
            ctx.setLineCap('round')
            items.map((item, i) => {
                let pX = average * ((1 - 0.04) / 2 + i)
                let pY = 120 - ((item.price - min) / full) * 120
                if (i == 0) {
                    ctx.moveTo(pX, pY)
                }
                ctx.lineTo(pX, pY)
            })
            ctx.setStrokeStyle('#EB6422')
            ctx.setLineWidth(1)
            ctx.stroke()

            // 下方的成交量，用矩形表示
            items.map((item, i) => {
                let w = (average * (1 - 0.04))
                let vX = average * i
                let h = (item.volume - minVolume) / fullVolume * 60
                let vY = 200 - h
                let color = '#F20642'
                if (i > 0 && (item.price - items[i-1].price < 0)) {
                    color = '#3BD595'
                }
                ctx.setFillStyle(color)
                ctx.fillRect(vX, vY, w, h)
            })

            ctx.draw()
        })
    },
    changeCommentCount (newCount) {
        this.setData({ commentSize: newCount })
    },
    bindChange (e) {
        this.setData({
            currentTab: e.detail.current
        })
    },
    touchmove () {
    },
    switchNav (e) {
        const current = e.currentTarget.dataset.current
        if(this.data.currentTab === current) {
            return false;
        } else {
            this.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    onShareAppMessage (option) {
        const postTitle = this.data.content.title
        const id = state.get('postid')
        const type = state.get('type')
        const path = `/${this.__route__}?id=${id}&type=${type}`

        return {
            title: postTitle,
            path: path
        }
    }
})
