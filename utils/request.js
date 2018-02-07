import * as http from './http';

const oauth = 'https://oauth.tigerbrokers.com'
const community = 'https://frontend-community.laohu8.com'
const news = 'https://stock-news.tigerbrokers.com'
const quotation = 'https://hq.tigerbrokers.com'

const _user = `${community}/v5/user`
export const getUser = () => http.get(_user)

const _signin = `${oauth}/api/v4/auth/sns/signin/wxapp`
export const signin = code => http.post(_signin, {
    data: {
        access_token: code,
        appVer: '1.0.0',
        platform: 'wxapp'
    }
})

const _actions = `${community}/v5/user/actions/key`
export const actions = () => http.get(_actions)

// 获取feeds
const _streamings = `${community}/v5/streamings`
export const streamings = (pageCount = 1, pageSize = 10) => http.get(_streamings, {
    data: {
        pageSize,
        pageCount
    }
})

// 获取收藏列表
const _favorite = `${community}/v5/user/favorites`
export const favorite = (pageCount = 1, pageSize = 10) => http.get(_favorite, {
    data: {
        pageSize,
        pageCount,
        type: -1
    }
})

const _forecast = id => `${community}/v5/forecast/${id}`
export const forecast = id => http.get(_forecast(id), {
    data: {
        wx: 1,
        __fieldtype: 'show'
    }
})
