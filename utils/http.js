const defaultOptions = {
    header: {
        'Authorization': `Bearer zLpDnG0204FAlVmUY3FMxRpPJxUVIS`
    }
}

export const run = cb => (result = {}) => new Promise((resolve, reject) => {
    result.success = _res => {
        if (_res.statusCode) {
            /(2|3)\d+/.test(_res.statusCode) ? resolve(_res.data) : reject(_res.data)
        } else {
            resolve(_res);
        }
    }

    result.fail = (...args) => reject(...args)

    cb(result)
})

export const get = (path, options = defaultOptions) => {
    if (!options.header) {
        options.header = defaultOptions.header
    }
    return run(wx.request)({
        url: path,
        data: options.data,
        header: options.header,
        method: 'GET',
        dataType: options.dataType || 'json',
        responseType: options.responseType || 'text',
        complete: () => {}
    })
}

export const post = (path, options = defaultOptions) => {
    if (!options.header) {
        options.header = defaultOptions.header
    }
    return run(wx.request)({
        url: path,
        data: options.data,
        header: options.header,
        method: 'POST',
        dataType: options.dataType || 'json',
        responseType: options.responseType || 'text',
        complete: () => {}
    })
}
