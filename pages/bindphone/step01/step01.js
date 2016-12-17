import { promise } from '../../../utils/utils'

Page({
    data: {},
    onLoad () {
        function add ({x=20, y=30} = {}) {
            return x + y
        }

        console.log(add({x: 50, y: 40}))

        function add2 ([x=20, y=40]) {
            return [x, y]
        }
        console.log(add2())
    }
})