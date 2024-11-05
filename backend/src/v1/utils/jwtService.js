const jwt = require('jsonwebtoken')
require('dotenv').config()

const genneralAccessToken = async (payload) => {
    // console.log('payload', payload)
    const access_token = jwt.sign({
        ...payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })

    return access_token
}

const genneralRefreshToken = async (payload) => {
    // console.log('payload', payload)
    const refresh_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '60d' })

    return refresh_token
}

module.exports = {
    genneralAccessToken,
    genneralRefreshToken,
}