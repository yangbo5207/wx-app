const defaultOptions = {
    header: {
        'Authorization': `Bearer zLpDnG0204FAlVmUY3FMxRpPJxUVIS`
    }
}

export const get = (path, options = defaultOptions) => new Promise((resolve, reject) => {
    if (!options.header) {
        options.header = defaultOptions.header
    }

    return wx.request({
        url: path,
        data: options.data,
        header: options.header,
        method: 'GET',
        dataType: options.dataType || 'json',
        responseType: options.responseType || 'text',
        success: resp => resolve(resp),
        fail: err => reject(err),
        complete: () => {}
    })
})

export const post = (path, options = defaultOptions) => new Promise((resolve, reject) => {
    if (!options.header) {
        options.header = defaultOptions.header
    }
    
    return wx.request({
        url: path,
        data: options.data,
        header: options.header,
        method: 'POST',
        dataType: options.dataType || 'json',
        responseType: options.responseType || 'text',
        success: resp => resolve(resp),
        fail: err => reject(err),
        complete: () => {}
    })
})
