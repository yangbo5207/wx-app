var HtmlToJson = require('../../wxParse/html2json')

Page({
    data: {
        comments: []
    },
    onLoad: function () {
        let self = this
        wx.request({
            url: 'https://test-frontend-community.laohu8.com/v5/object/1/6711/comments',
            data: {
                pageCount: 1,
                pageSize: 20
            },
            header: {
                // 'Authorization': 'Bearer 52gIBGxCzUjkJoCk6ZRvZ84K6lhzBQv6HASo19jiM4rpON****'
                'Authorization': 'Bearer JH3waLHzoCdUoUclDFkyIwU92Oen79U4ivJrKGJYE9TCmT****'
            },
            success: function (res) {
                // res.data.data.map( item => {
                //     item.html = HtmlToJson.html2json(item.html, 'commentContent')
                //     return item;
                // })
                self.setData({
                    comments: res.data.data
                })
                console.log(self.data.comments)
            }
        })
    }
})