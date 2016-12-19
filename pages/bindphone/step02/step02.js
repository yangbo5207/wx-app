Page({
    data: {
        isEncryption: 1
    },
    onLoad () {},
    switchEncryption () {
        this.setData({
            isEncryption: !this.data.isEncryption
        })
    }
})
