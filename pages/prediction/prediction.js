import config from '../../utils/config'
import state from '../../utils/state'
import WxParse from '../../components/wxParse/wxParse'
import { http, formatTime } from '../../utils/utils'
import actionsBar from '../../components/actionsBar/actionsBar'

Page({
    data: {
        currentTab: 0,
        content: '',
        tabItemWidth: 25,
        swiperHeight: 0,
        scrollViewHeight: 0
    },
    onLoad: function () {
        const postid = 1
        const type = 6
        const authorization = state.get('authorization')

        Object.assign(this, actionsBar.optionFn)
        this.initialAction()
        state.bind('changeCommentCount', this.changeCommentCount, this)

        http(wx.getSystemInfo)()
        .then(result => {
            this.setData({
                swiperHeight: result.windowHeight - 50,
                scrollViewHeight: result.windowHeight - 100
            })
        })
        http(wx.request)({
            url: `${config.community}/v5/forecast/${postid}`,
            header: { Authorization: authorization },
            data: {
                wx: 1,
                __fieldtype: 'show'
            }
        }).then(result => {
            let replyArr = []
            result.data.gmtCreate = formatTime(result.data.gmtCreate)
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
            replyArr[0] = '<div class="textMain"><p>$(aapl)$传苹果公司裁掉几十名无人驾驶汽车计划的员工，并打算将这个计划从头开始。</p><p style="text-align: center;"><img alt="" src="http://tigerbrokers.cdn.bj.xs3cnc.com/fc1d34e0-8f77-11e6-8ff4-001c7cfa2232?dp_cmd=/imageView2/mode/2/q/30"/></p><p>据智通财经了解，苹果告诉员工，这些裁员是“重启”这个无人驾车计划的一部分，苹果发言人拒绝就此发表评论。</p><p>裁员显示苹果在无人驾车发展上又碰上了新的困难，过去两年来苹果一直将资源汇集到这个名为“巨人”(Titan)的无人驾车计划中，但是一直无法有显著进展。</p><p>今年七月，苹果指派资深员工Bob Mansfield来主持这个计划。Mansfield领导苹果团队已经调整了无人驾车计划的重心，从设计和生产一台汽车改成发展基础自动驾驶汽车的科技。</p><p style="text-align: center;"><img alt="" src="http://tigerbrokers.cdn.bj.xs3cnc.com/fc8478e4-8f77-11e6-8ff4-001c7cfa2232?dp_cmd=/imageView2/mode/2/q/30"/></p><p>苹果虽然不是唯一在发展无人驾车的公司，但却是最保密至上的。</p><p>苹果从未正面承认它正在发展无人驾驶汽车，虽然在今年的年度股东大会上，首席执行官库克曾说过，汽车工业正在进行一个剧烈的改变，他也似乎承认了汽车计划。</p><p>但苹果自从增加研发自驾车的人力和时间两年后，开始碰上许多问题，例如苹果团队能不能做出比其他公司的自驾车更好的产品。原本主持苹果自驾车计划的Steven Zadesky今年因为个人理由离开公司，原本已经退休的Mansfield后来回到苹果接手这个计划。</p><p>随着苹果旗舰产品iPhone销量的减少，无人驾驶汽车或将成为苹果的一个新市场。</p><p> </p></div>'

            replyArr.map((item, i) => {
                WxParse.wxParse('reply' + i, 'html', item, this)
                if (i == replyArr.length - 1) {
                    WxParse.wxParseTemArray("replyTemArray",'reply', replyArr.length, this)
                }
            })

            // this.render(result.data.bodies[0].html)
            this.setData({
                content: result.data,
                tabItemWidth: 100/result.data.bodies.length,
                commentSize: result.data.commentSize,
                likeSize: result.data.likeSize
            })
        })
    },
    changeCommentCount (newCount) {
        this.setData({ commentSize: newCount })
    },
    bindChange: function (e) {
        this.setData({
            currentTab: e.detail.current
        })
    },
    switchNav: function (e) {
        const current = e.currentTarget.dataset.current
        if(this.data.currentTab === current) {
            return false;
        } else {
            this.setData({
                currentTab: e.target.dataset.current
            })
        }
    }
})
