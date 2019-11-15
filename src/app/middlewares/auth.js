const jwt = require('jsonwebtoken')
const { promisify } = require('util') //Converte callback em async await
const authConfig = require('../../config/auth')

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: " Token Not Provided" })
    }

    const [, token] = authHeader.split(" ")

    try {
        const decoded = await promisify(jwt.verify)(token, authConfig.secret)
        req.userId = decoded.id

        return next()
    } catch (err) {
        return res.status(401).json({ error: "Token invalid" })
    }
}