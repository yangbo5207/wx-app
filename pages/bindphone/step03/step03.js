Page({
    data: {
        phoneNumber: '13718035754',
        countDown: 60,
        isCountdownEnd: 0,
        isError: 0
    },
    onLoad () {
        setTimeout( () => {
            this.countDown()
        }, 1000)
    },
    countDown () {
        let timer = null
        timer = setTimeout( () => {
            this.setData({
                countDown: this.data.countDown - 1
            })

            if (this.data.countDown > 0) {
                this.countDown()
            } else {
                this.setData({
                    isCountdownEnd: 1
                })
            }
        }, 1000)
    },
    sendVerificationCode () {
        console.log('send verification code')
        this.setData({
            countDown: 60,
            isCountdownEnd: 0
        })
        this.countDown()
    },
    finishRegister () {
        this.setData({
            isError: 1
        })
    }
})
