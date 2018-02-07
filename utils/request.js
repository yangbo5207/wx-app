import * as http from './http';

const oauth = 'https://oauth.tigerbrokers.com'
const community = 'https://frontend-community.laohu8.com'
const news = 'https://stock-news.tigerbrokers.com'
const quotation = 'https://hq.tigerbrokers.com'

export const wxLogin = () => new Promise((resolve, reject) => {
    wx.login({
        success: resp => resolve(resp),
        fail: err => reject(err)
    })
})

export const wxGetUserInfo = (options = {}) => new Promise((resolve, reject) => {
    wx.getUserInfo({
        withCredentials: options.withCredentials || true,
        lang: options.lang || 'en',
        success: resp => resolve(resp),
        fail: err => reject(err)
    })
})

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
