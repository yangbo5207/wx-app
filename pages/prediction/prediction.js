Page({
    data: {
        currentTab: 0
    },
    onLoad: function () {
        wx.showToast({
            title: '已赞同',
            icon: 'success',
            duration: 2000
        })
    },
    bindChange: function (e) {
        this.setData({
            currentTab: e.detail.current
        })
    },
    switchNav: function (e) {
        let self = this

        if(this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            self.setData({
                currentTab: e.target.dataset.current
            })
        }
    }
}) 
